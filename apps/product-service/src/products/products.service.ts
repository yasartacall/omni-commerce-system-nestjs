import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { Product } from './entities/product.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
} from '@omni/common';
import { REDIS_CLIENT, CACHE_TTL, CACHE_KEYS } from '../redis/redis.constants';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    const saved = await this.productRepo.save(product);
    await this.invalidateListCache();
    return saved;
  }

  async findAll(): Promise<Product[]> {
    const cached = await this.redis.get(CACHE_KEYS.PRODUCT_LIST);
    if (cached) {
      return JSON.parse(cached) as Product[];
    }

    const products = await this.productRepo.find({
      order: { createdAt: 'DESC' },
    });

    await this.redis.setex(
      CACHE_KEYS.PRODUCT_LIST,
      CACHE_TTL.PRODUCT_LIST,
      JSON.stringify(products),
    );

    return products;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = CACHE_KEYS.PRODUCT(id);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Product;
    }

    const product = await this.productRepo.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    await this.redis.setex(
      cacheKey,
      CACHE_TTL.PRODUCT,
      JSON.stringify(product),
    );
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    const updated = await this.productRepo.save(product);
    await this.invalidateProductCache(id);
    await this.invalidateListCache();
    return updated;
  }

  async updateStock(id: string, dto: UpdateStockDto): Promise<Product> {
    const product = await this.findOne(id);
    product.stockQuantity = dto.stockQuantity;
    const updated = await this.productRepo.save(product);
    await this.invalidateProductCache(id);
    await this.invalidateListCache();
    return updated;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    await this.invalidateProductCache(id);
    await this.invalidateListCache();
  }

  // Saga tarafından çağrılır — stok yeterliliğini kontrol eder
  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    return !!product && product.stockQuantity >= quantity;
  }

  // Saga tarafından çağrılır — stoğu düşer
  async deductStock(productId: string, quantity: number): Promise<void> {
    await this.productRepo.decrement(
      { id: productId },
      'stockQuantity',
      quantity,
    );
    await this.invalidateProductCache(productId);
    await this.invalidateListCache();
  }

  // Saga compensating transaction — stoğu geri yükler
  async restoreStock(productId: string, quantity: number): Promise<void> {
    await this.productRepo.increment(
      { id: productId },
      'stockQuantity',
      quantity,
    );
    await this.invalidateProductCache(productId);
    await this.invalidateListCache();
  }

  private async invalidateListCache(): Promise<void> {
    await this.redis.del(CACHE_KEYS.PRODUCT_LIST);
  }

  private async invalidateProductCache(id: string): Promise<void> {
    await this.redis.del(CACHE_KEYS.PRODUCT(id));
  }
}
