/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu.items.service';
import { MenuItemsController } from './menu.items.controller';
import { MenuItem } from './schemas/menu.item.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItemSchema } from './schemas/menu.item.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: MenuItem.name, schema: MenuItemSchema }])],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
})
export class MenuItemsModule {}
