import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GrpcMetricsInterceptor, LoggingInterceptor, GenericExceptionFilter, TraceMethod } from '@ms/common';
import { ConvertTimeStamps, ValidateGrpcPayload } from "@ms/common/decorators";
import { DeleteProductDto } from './dto/delete-product.dto';
import { FindAllProductsDto } from './dto/findAll-product.dto';
import { FindOneProductDto } from './dto/findOne-product.dto';
import { FindProductsByIds } from './dto/findByIds-product.dto';

export const ProductService = "ProductsService"

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(LoggingInterceptor)
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @GrpcMethod(ProductService, "Create")
  @ValidateGrpcPayload(CreateProductDto)
  @TraceMethod()
  @ConvertTimeStamps("product", "both", true)
  create(createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @GrpcMethod(ProductService, "FindAll")
  @ValidateGrpcPayload(FindAllProductsDto)
  @TraceMethod()
  @ConvertTimeStamps("products", "both", true)
  async findAll(data: FindAllProductsDto) {
    return this.productsService.findAll(data);
  }

  @GrpcMethod(ProductService, "FindProductsByIds")
  @ValidateGrpcPayload(FindProductsByIds)
  @TraceMethod()
  @ConvertTimeStamps("products", "both", true)
  findProductsByIds(data: FindProductsByIds) {
    return this.productsService.findProductsByIds(data);
  }

  @GrpcMethod(ProductService, "FindOne")
  @ValidateGrpcPayload(FindOneProductDto)
  @TraceMethod()
  @ConvertTimeStamps("product", "both", true)
  findOne(data: FindOneProductDto) {
    return this.productsService.findOne(data);
  }

  @GrpcMethod(ProductService, "Update")
  @ValidateGrpcPayload(UpdateProductDto)
  @TraceMethod()
  @ConvertTimeStamps("product", "both", true)
  update(data: UpdateProductDto) {
    return this.productsService.update(data);
  }

  @GrpcMethod(ProductService, "DeleteOne")
  @ValidateGrpcPayload(DeleteProductDto)
  @TraceMethod()
  remove(data : DeleteProductDto) {
    return this.productsService.remove(data);
  }
}

