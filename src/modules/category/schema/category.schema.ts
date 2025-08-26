import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Category {
  @Prop()
  name: string;

  @Prop()
  description: string;
}
