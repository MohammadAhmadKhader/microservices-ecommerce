import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GrpcMetricsInterceptor, LoggingInterceptor, GenericExceptionFilter, TraceMethod } from '@ms/common';
import { ValidateGrpcPayload } from "@ms/common/decorators";
import { DeleteProductDto } from './dto/delete-product.dto';
import { FindAllProductsDto } from './dto/findAll-product.dto';
import { FindOneProductDto } from './dto/findOne-product.dto';
import { FindProductsByIds } from './dto/findByIds-product.dto';
import { CreateProductResponse, FindAllProductsResponse, FindOneProductResponse, FindProductsByIdsResponse, UpdateProductResponse } from '@ms/common/generated/products';
import { Product } from './entities/product.entity';
import { EmptyBody } from '@ms/common/generated/shared';

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
  async create(createProductDto: CreateProductDto): Promise<CreateProductResponse> {
    const result = await this.productsService.create(createProductDto);
    return { ...result, product: result.product.ToProto()}
  }

  @GrpcMethod(ProductService, "FindAll")
  @ValidateGrpcPayload(FindAllProductsDto)
  @TraceMethod()
  async findAll(data: FindAllProductsDto): Promise<FindAllProductsResponse> {
    const result = await this.productsService.findAll(data)
    return { ...result, products: Product.ToProtoArray(result.products)};
  }

  @GrpcMethod(ProductService, "FindProductsByIds")
  @ValidateGrpcPayload(FindProductsByIds)
  @TraceMethod()
  async findProductsByIds(data: FindProductsByIds): Promise<FindProductsByIdsResponse> {
    const result = await this.productsService.findProductsByIds(data);
    return { products: Product.ToProtoArray(result.products) }
  }

  @GrpcMethod(ProductService, "FindOne")
  @ValidateGrpcPayload(FindOneProductDto)
  async findOne(data: FindOneProductDto): Promise<FindOneProductResponse> {
    const result = await this.productsService.findOne(data);
    return { product: result.product.ToProto() }
  }

  @GrpcMethod(ProductService, "Update")
  @ValidateGrpcPayload(UpdateProductDto)
  @TraceMethod()
  async update(data: UpdateProductDto): Promise<UpdateProductResponse> {
    const result = await this.productsService.update(data);
    return { product: result.product.ToProto() }
  }

  @GrpcMethod(ProductService, "DeleteOne")
  @ValidateGrpcPayload(DeleteProductDto)
  @TraceMethod()
  async remove(data : DeleteProductDto): Promise<EmptyBody> {
    return await this.productsService.remove(data);
  }
}

