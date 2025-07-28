/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { OrderDetailService } from './order.detail.service';
import { OrderDetailController } from './order.detail.controller';
import { OrderDetail } from './schemas/order.detail.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderDetailSchema } from './schemas/order.detail.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: OrderDetail.name, schema: OrderDetailSchema }])],
  controllers: [OrderDetailController],
  providers: [OrderDetailService],
})
export class OrderDetailModule {}
