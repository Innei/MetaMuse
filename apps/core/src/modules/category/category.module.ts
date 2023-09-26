import { Module } from '@nestjs/common'

import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { CategoryTRPCRouter } from './category.trpc'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryTRPCRouter],
  exports: [CategoryService, CategoryTRPCRouter],
})
export class CategoryModule {}
