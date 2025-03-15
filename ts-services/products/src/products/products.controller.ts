import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MetricsService } from '@ms/common/modules/metrics/metrics.service';
import { CreateMetricsDecorator } from '@ms/common/modules/metrics/metrics.decorator';
import { appServicesMap } from './products.module';
import { ServerUnaryCall } from "@grpc/grpc-js";

const ProductService = "ProductsService"
const Metrics = CreateMetricsDecorator(ProductService, () => appServicesMap.get(MetricsService.name))

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService, private readonly metricsService: MetricsService) {}

  @GrpcMethod(ProductService, "Create")
  @Metrics("Create")
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @GrpcMethod(ProductService, "Find")
  @Metrics("Find")
  findAll(data:{page:number,limit:number}, call: ServerUnaryCall<any,any>) {
    console.log(call.getDeadline())
    return this.productsService.findAll(data.page, data.limit);
  }

  @GrpcMethod(ProductService, "FindProductsByIds")
  @Metrics("FindProductsByIds")
  findProductsByIds(data:{Ids: number[]}) {
    return this.productsService.findProductsByIds(data.Ids);
  }

  @GrpcMethod(ProductService, "FindOne")
  @Metrics("FindOne")
  findOne(data:{id :number}) {
    return this.productsService.findOne(data.id);
  }

  @GrpcMethod(ProductService, "Update")
  @Metrics("Update")
  update(@Payload() updateProductDto: UpdateProductDto) {
    const {id, ...updateData} = updateProductDto
    return this.productsService.update(id, updateData);
  }

  @GrpcMethod(ProductService, "DeleteOne")
  @Metrics("DeleteOne")
  remove(@Payload() id: number) {
    return this.productsService.remove(id);
  }
}

