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
import { JwtAuthGuard, JwtPayload } from '@omni/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateOrderDto): Promise<Order> {
    const user = req.user as JwtPayload;
    return this.ordersService.create(user.sub, dto);
  }

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
