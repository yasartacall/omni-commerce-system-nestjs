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
  create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const userId = (req.user as JwtPayload).sub;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.ordersService.create(dto, userId);
  }

  @ApiOperation({ summary: 'Kendi siparişlerim' })
  @ApiResponse({ status: 200, description: 'Sipariş listesi' })
  @Get()
  findAll(@Req() req: Request) {
    const userId = (req.user as JwtPayload).sub;
    return this.ordersService.findAll(userId);
  }

  @ApiOperation({ summary: 'Sipariş detayı (saga durumunu poll etmek için)' })
  @ApiResponse({ status: 200, description: 'Sipariş bulundu' })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = (req.user as JwtPayload).sub;
    return this.ordersService.findOne(id, userId);
  }
}
