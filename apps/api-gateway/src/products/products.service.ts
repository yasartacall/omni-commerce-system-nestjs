import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
} from '@omni/common';

@Injectable()
export class ProductsService {
  constructor(private readonly http: HttpService) {}

  create(dto: CreateProductDto) {
    return this.forward(this.http.post<unknown>('/products', dto));
  }

  findAll() {
    return this.forward(this.http.get<unknown>('/products'));
  }

  findOne(id: string) {
    return this.forward(this.http.get<unknown>(`/products/${id}`));
  }

  update(id: string, dto: UpdateProductDto) {
    return this.forward(this.http.patch<unknown>(`/products/${id}`, dto));
  }

  updateStock(id: string, dto: UpdateStockDto) {
    return this.forward(this.http.patch<unknown>(`/products/${id}/stock`, dto));
  }

  remove(id: string) {
    return this.forward(this.http.delete<unknown>(`/products/${id}`));
  }

  private async forward(
    request: Observable<AxiosResponse<unknown>>,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(request);
      return data;
    } catch (error) {
      return this.handleError(error, 'product-service');
    }
  }

  private handleError(error: unknown, upstream: string): never {
    if (isAxiosError(error)) {
      if (error.response) {
        throw new HttpException(
          error.response.data as string | Record<string, unknown>,
          error.response.status,
        );
      }
      throw new InternalServerErrorException(`${upstream} unreachable`);
    }
    throw error;
  }
}
