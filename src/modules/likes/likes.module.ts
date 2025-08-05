import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { Like } from './schemas/like.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeSchema } from '@/modules/likes/schemas/like.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
