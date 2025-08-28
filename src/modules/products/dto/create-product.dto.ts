import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Category is required' })
  @IsMongoId({ message: 'Category must be a valid ObjectId' })
  category: string;

  @IsOptional()
  @IsString({ message: 'Brand must be a string' })
  brand: string;

  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'Stock must be a number' })
  stock: number;

  @IsOptional()
  @IsString({ message: 'Specs must be a string' })
  specs: string;

  @IsOptional()
  @IsString({ message: 'Image must be a string' })
  image: string;
}
