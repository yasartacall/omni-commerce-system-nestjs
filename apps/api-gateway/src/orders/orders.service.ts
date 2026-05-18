import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly http: HttpService) {}

  create(dto: CreateOrderDto, auth: string) {
    return this.forward(
      this.http.post<unknown>('/orders', dto, {
        headers: { Authorization: auth },
      }),
    );
  }

  findAll(auth: string) {
    return this.forward(
      this.http.get<unknown>('/orders', { headers: { Authorization: auth } }),
    );
  }

  findOne(id: string, auth: string) {
    return this.forward(
      this.http.get<unknown>(`/orders/${id}`, {
        headers: { Authorization: auth },
      }),
    );
  }

  private async forward(
    request: Observable<AxiosResponse<unknown>>,
  ): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(request);
      return data;
    } catch (error) {
      return this.handleError(error, 'order-service');
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
