import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@omni/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

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
  create(@Body() dto: CreateOrderDto, @Headers('authorization') auth: string) {
    return this.ordersService.create(dto, auth);
  }

  @ApiOperation({ summary: 'Kendi siparişlerim' })
  @ApiResponse({ status: 200, description: 'Sipariş listesi' })
  @Get()
  findAll(@Headers('authorization') auth: string) {
    return this.ordersService.findAll(auth);
  }

  @ApiOperation({ summary: 'Sipariş detayı (saga durumunu poll etmek için)' })
  @ApiResponse({ status: 200, description: 'Sipariş bulundu' })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('authorization') auth: string,
  ) {
    return this.ordersService.findOne(id, auth);
  }
}
