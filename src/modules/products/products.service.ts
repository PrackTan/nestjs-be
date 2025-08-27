import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '@/types/TypeUser';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Product, ProductDocument } from './schema/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: SoftDeleteModel<ProductDocument>,
  ) {}

  create(createProductDto: CreateProductDto, user: User) {
    const product = new this.productModel({
      ...createProductDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
      updatedBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return product.save();
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, skip, sort, projection, population } = aqp(qs);
    const offset = (currentPage - 1) * limit;
    const products = await this.productModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .sort(sort as any)
      .select(projection)
      .populate(population);
    return products;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(id: number, updateProductDto: UpdateProductDto, user: User) {
    const existingProduct = await this.productModel.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }
    await this.productModel.updateOne(
      { _id: id },
      { $set: { ...updateProductDto, updatedBy: user._id } },
    );
    return this.productModel.findById(id);
  }

  async remove(id: number, user: User) {
    const existingProduct = await this.productModel.findById(id);
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }
    await this.productModel.updateOne(
      { _id: id },
      { $set: { deletedBy: user._id } },
    );
    await this.productModel.softDelete({ _id: id });
    return existingProduct;
  }
}
