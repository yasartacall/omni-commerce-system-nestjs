import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload, CreateOrderDto } from '@omni/common';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Sipariş oluştur — Kafka Saga başlatır' })
  @ApiResponse({
    status: 201,
    description: 'Sipariş PROCESSING durumunda oluşturuldu',
  })
  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.ordersService.create(dto, req.user.sub);
  }

  @ApiOperation({ summary: 'Kendi siparişlerim' })
  @ApiResponse({ status: 200, description: 'Sipariş listesi' })
  @Get()
  findAll(@Req() req: Request & { user: JwtPayload }) {
    return this.ordersService.findAll(req.user.sub);
  }

  @ApiOperation({ summary: 'Sipariş detayı (saga durumunu poll etmek için)' })
  @ApiResponse({ status: 200, description: 'Sipariş bulundu' })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.ordersService.findOne(id, req.user.sub);
  }

  @ApiOperation({
    summary:
      'Demo: Saga compensation — stok düşümü başarısız, ödeme iade edilir',
    description:
      'Gerçek Saga tazminat senaryosunu tetikler: stok kontrolü ✅ → ödeme BAŞARILI ✅ → ' +
      'stok düşümü BAŞARISIZ ✗ → payment.refund.requested eventi → ödeme REFUNDED → sipariş FAILED. ' +
      "Sipariş ID ile GET /orders/:id endpoint'ini poll ederek durumu izleyin; " +
      'Jaeger üzerinde tüm 5 Kafka hop takip edilebilir.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Sipariş PROCESSING başladı — stok düşümünde FAILED, ödeme REFUNDED olacak',
  })
  @Post('demo/force-fail')
  createWithFailedPayment(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto, '__force_fail_deduct__');
  }
}
