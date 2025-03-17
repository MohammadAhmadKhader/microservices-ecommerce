import { Catch, Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MetricsService } from '@ms/common/modules/metrics/metrics.service';
import { GrpcMetricsInterceptor } from '@ms/common/modules/metrics/metrics.interceptor';
import { LoggingInterceptor } from '@ms/common/observability/logger';
import { ValidateGrpcPayload } from "@ms/common/decorators";
import { DeleteProductDto } from './dto/delete-product.dto';
import { FindAllProductsDto } from './dto/findAll-product.dto';
import { FindOneProductDto } from './dto/findOne-product.dto';
import { FindProductsByIds } from './dto/findByIds-product.dto';
import {GenericExceptionFilter} from "@ms/common/exceptionFilters"

const ProductService = "ProductsService"

@UseFilters(GenericExceptionFilter)
@UseInterceptors(GrpcMetricsInterceptor)
@UseInterceptors(new LoggingInterceptor())
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService, private readonly metricsService: MetricsService) {}

  @GrpcMethod(ProductService, "Create")
  @ValidateGrpcPayload(CreateProductDto)
  create(createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @GrpcMethod(ProductService, "FindAll")
  @ValidateGrpcPayload(FindAllProductsDto)
  async findAll(data: FindAllProductsDto) {
    return this.productsService.findAll(data);
  }

  @GrpcMethod(ProductService, "FindProductsByIds")
  @ValidateGrpcPayload(FindProductsByIds)
  findProductsByIds(data: FindProductsByIds) {
    return this.productsService.findProductsByIds(data);
  }

  @GrpcMethod(ProductService, "FindOne")
  @ValidateGrpcPayload(FindOneProductDto)
  findOne(data: FindOneProductDto) {
    return this.productsService.findOne(data);
  }

  @GrpcMethod(ProductService, "Update")
  @ValidateGrpcPayload(UpdateProductDto)
  update(data: UpdateProductDto) {
    return this.productsService.update(data);
  }

  @GrpcMethod(ProductService, "DeleteOne")
  @ValidateGrpcPayload(DeleteProductDto)
  remove(data : DeleteProductDto) {
    return this.productsService.remove(data);
  }
}

