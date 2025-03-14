import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Metadata } from '@grpc/grpc-js';
import { context, propagation } from '@opentelemetry/api';
import { MetricsInterceptor } from '@ms/common/interceptors';

const ProductService = "ProductsService"

@UseInterceptors(MetricsInterceptor)
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @GrpcMethod(ProductService, "Create")
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @GrpcMethod(ProductService, "Find")
  findAll(data:{page:number,limit:number}) {
    return this.productsService.findAll(data.page, data.limit);
  }

  @GrpcMethod(ProductService, "FindProductsByIds")
  findProductsByIds(data:{Ids: number[]}, metadata: Metadata) {
    console.log(metadata)
    const carrier= metadata.getMap()
    const ctx = propagation.extract(context.active(), carrier)
    console.log(ctx, "context")
    return this.productsService.findProductsByIds(data.Ids, metadata);
  }

  @GrpcMethod(ProductService, "FindOne")
  findOne(data:{id :number}) {
    return this.productsService.findOne(data.id);
  }

  @GrpcMethod(ProductService, "Update")
  update(@Payload() updateProductDto: UpdateProductDto) {
    const {id, ...updateData} = updateProductDto
    return this.productsService.update(id, updateData);
  }

  @GrpcMethod(ProductService, "DeleteOne")
  remove(@Payload() id: number) {
    return this.productsService.remove(id);
  }
}
