/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LikesModule } from '@/modules/likes/likes.module';
import { UsersModule } from '@/modules/users/users.module';
import { MenuItemOptionsModule } from '@/modules/menu.item.options/menu.item.options.module';
import { MenuItemsModule } from '@/modules/menu.items/menu.items.module';
import { MenusModule } from '@/modules/menus/menus.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { OrderDetail } from '@/modules/order.detail/schemas/order.detail.schema';
import { RestaurantsModule } from '@/modules/restaurants/restaurants.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';
import { TicketModule } from './ticket/ticket.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    UsersModule,
    LikesModule,
    MenuItemOptionsModule,
    MenuItemsModule,
    MenusModule,
    OrdersModule,
    OrderDetail,
    RestaurantsModule,
    ReviewsModule,
    ConfigModule.forRoot({isGlobal: true,}), 

  MongooseModule.forRootAsync({
    imports:[ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      uri: configService.get<string>('MONGODB_URI'),
    }),
    inject: [ConfigService],
  }), TicketModule, DbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
