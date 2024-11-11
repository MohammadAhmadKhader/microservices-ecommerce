import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const ProductService = "ProductsService"

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
  findProductsByIds(data:{Ids: number[]}) {
    console.log(data)
    return this.productsService.findProductsByIds(data.Ids);
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
