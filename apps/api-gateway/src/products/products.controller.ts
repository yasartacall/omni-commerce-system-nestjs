import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
} from '@omni/common';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Yeni ürün oluştur' })
  @ApiResponse({ status: 201, description: 'Ürün oluşturuldu' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiOperation({ summary: 'Tüm ürünleri listele (Redis cache-aside)' })
  @ApiResponse({ status: 200, description: 'Ürün listesi' })
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @ApiOperation({ summary: 'ID ile ürün getir' })
  @ApiResponse({ status: 200, description: 'Ürün bulundu' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ summary: 'Ürün güncelle' })
  @ApiResponse({ status: 200, description: 'Güncellendi' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Stok miktarını güncelle' })
  @ApiResponse({ status: 200, description: 'Stok güncellendi' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch(':id/stock')
  updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.productsService.updateStock(id, dto);
  }

  @ApiOperation({ summary: 'Ürünü sil' })
  @ApiResponse({ status: 204, description: 'Silindi' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
