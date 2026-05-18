import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrderDto } from '@omni/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
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
  create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Kendi siparişlerim' })
  @ApiResponse({ status: 200, type: [Order] })
  @Get()
  findAll(@Headers('x-user-id') userId: string): Promise<Order[]> {
    return this.ordersService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
  ): Promise<Order> {
    return this.ordersService.findOne(id, userId);
  }
}
