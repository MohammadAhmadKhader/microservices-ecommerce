import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductProtobuf } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { FindAllProductsRequest, FindAllProductsResponse, FindProductsByIdsResponse, FindOneProductRequest, DeleteOneProductRequest, FindProductsByIdsRequest, CreateProductResponse } from '@ms/common/generated/products'
import { createConsumer, createDLQConsumer } from './broker';
import { BrokerService } from '@ms/common/modules/broker/broker.service';
import { UpdateStocksParams } from './types/types';
import { trace } from '@opentelemetry/api';
import { RpcFailedPreConditionException, RpcNotFoundException} from "@ms/common"
import { TraceMethod } from '@ms/common/observability/telemetry';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>){}

  async onModuleInit(){
    await this.initializeBroker()
  }

  private async initializeBroker() {
    const broker = new BrokerService()
    await broker.initialize()
    const consumer = createConsumer(this)
    const dlqConsumer = createDLQConsumer(this)
    await broker.addConsumer(consumer)
    await broker.addConsumer(dlqConsumer)
  }

  @TraceMethod()
  async create(createProductDto: CreateProductDto): Promise<{product: ProductProtobuf}> {
    const span = trace.getActiveSpan()
    if (span) {
      span.setAttribute('payload', JSON.stringify(createProductDto));
    }

    const product = await this.productRepository.save(createProductDto)

    return { product: product.ConvertToProtobufType()}
  }

  @TraceMethod()
  async findAll({page, limit}: FindAllProductsRequest): Promise<FindAllProductsResponse> {
    const span = trace.getActiveSpan()

    if (span) {
      span.setAttribute('page', page);
      span.setAttribute('limit', limit);
    }
    
    const skip = (page - 1) * limit
    const [products, count] = await this.productRepository.findAndCount({
      order:{
        createdAt:-1
      },
      take:limit,
      skip:skip
    })

    span.setAttribute("db.rowCount", products.length)

    const productsProtobufs = products.map((product)=>{
      return new ProductProtobuf(product)
    })

    return {page, limit, count:count,products:productsProtobufs as any};
  }

  @TraceMethod()
  async findOne({id}: FindOneProductRequest): Promise<{product: ProductProtobuf}> {
    const product = await this.productRepository.findOneBy({
      id,
    })
    if (!product) {
      throw new RpcNotFoundException(`product with id '${id}' was not found`)
    }
   
    const productResponse = product.ConvertToProtobufType()
    return {product: productResponse};
  }

  
  @TraceMethod()
  async findProductsByIds({ ids }: FindProductsByIdsRequest): Promise<FindProductsByIdsResponse> {
    const products = await this.productRepository.find({
      where :{
        id : In(ids)
      }
    })

    const protobufsProducts = products.map((prod)=>{
      return prod.ConvertToProtobufType()
    }) 

    return { products: protobufsProducts as unknown as Product[]}
  }

  @TraceMethod()
  async update({id, ...updateData}: UpdateProductDto) : Promise<{product: ProductProtobuf}> {
    const product = await this.productRepository.findOneBy({id})
    if (!product) {
      throw new RpcNotFoundException(`product with id ${id} was not found`)
    }

    Object.assign(product, updateData)
    await this.productRepository.save({
      id,
      ...updateData,
      updatedAt: new Date() // solving bug with inaccurate date update from typeORM
    })

    return { product: product.ConvertToProtobufType() };
  }

  @TraceMethod()
  async remove({ id }:DeleteOneProductRequest): Promise<void> {
    await this.productRepository.delete(id)
  }

  @TraceMethod()
  async updateStock(productsIdsWithQty : UpdateStocksParams){
    const prodIdQtyMap = {}
    let caseStatements = ""
    const productsIds = productsIdsWithQty.map((item)=>{
      prodIdQtyMap[item.productId] = item.quantity

      caseStatements += `WHEN id = ${item.productId} THEN quantity - ${item.quantity} `

      return item.productId
    })

    const products = await this.productRepository.find({
      where:{
        id:In(productsIds)
      }
    })

    if (products.length != productsIds.length) {
      const existingIdMap = {}
      products.forEach((prod)=>{
        if(prod.quantity < prodIdQtyMap[prod.id]) {
          throw new RpcFailedPreConditionException(`product with id: '${prod.id}' has quantity: '${prod.quantity}' which less than the requested amount: '${prodIdQtyMap[prod.id]}'`)
        }
        existingIdMap[prod.id] = prod
      })
      const lostIds = []
      productsIds.forEach((id)=>{
        if(!existingIdMap[id]) {
          lostIds.push(id)
        }
      })

      throw new RpcNotFoundException(`products with following id were not exist: ${lostIds.join(", ")}`)
    }
    
    const updateRes = await this.productRepository
    .createQueryBuilder().update(Product).set({
      quantity: ()=> `CASE ${caseStatements} ELSE quantity END`
    }).whereInIds(productsIds).execute()

    return updateRes
  }
}
