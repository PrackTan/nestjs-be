import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RUser } from '@/decorator/customize.request';
import { User } from '@/types/TypeUser';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @RUser() user: User) {
    console.log('User object received:', user);
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(
    @Query() qs: string,
    @Query('current') currentPage: string,
    @Query('pageSize') pageSize: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    // return { qs };
    return this.productsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @RUser() user: User,
  ) {
    return this.productsService.update(+id, updateProductDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @RUser() user: User) {
    return this.productsService.remove(+id, user);
  }
}
