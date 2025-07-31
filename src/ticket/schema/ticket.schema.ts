import { Prop } from '@nestjs/mongoose';

export class Ticket {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: false })
  isBooked: boolean;
}
