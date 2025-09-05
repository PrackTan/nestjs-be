import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, roleSchema } from './schema/role.schema';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: roleSchema }]),
  ],
  exports: [RoleService],
})
export class RoleModule {}
