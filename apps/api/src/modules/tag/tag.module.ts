import { Module } from '@nestjs/common';
import { TagController } from './tag.controller.js';
import { TagService } from './tag.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}