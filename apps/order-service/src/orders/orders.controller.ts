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
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, JwtPayload, CreateOrderDto } from '@omni/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';

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
    type: Order,
  })
  @Post()
  create(@Req() req: Request, @Body() dto: CreateOrderDto): Promise<Order> {
    const user = req.user as JwtPayload;
    return this.ordersService.create(user.sub, dto);
  }

  @ApiOperation({ summary: 'Kendi siparişlerim' })
  @ApiResponse({ status: 200, type: [Order] })
  @Get()
  findAll(@Req() req: Request): Promise<Order[]> {
    const user = req.user as JwtPayload;
    return this.ordersService.findAll(user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<Order> {
    const user = req.user as JwtPayload;
    return this.ordersService.findOne(id, user.sub);
  }
}
