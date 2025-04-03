import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductProtobuf } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { FindAllProductsRequest, FindAllProductsResponse, FindProductsByIdsResponse, FindOneProductRequest, DeleteOneProductRequest, FindProductsByIdsRequest, CreateProductResponse, FindOneProductResponse, UpdateProductResponse } from '@ms/common/generated/products'
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

  async create(createProductDto: CreateProductDto): Promise<CreateProductResponse> {
    const span = trace.getActiveSpan()
    if (span) {
      span.setAttribute('payload', JSON.stringify(createProductDto));
    }

    const product = await this.productRepository.save(createProductDto)

    return { product }
  }

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

    return {page, limit, count:count, products };
  }

  async findOne({id}: FindOneProductRequest): Promise<FindOneProductResponse> {
    const product = await this.productRepository.findOneBy({
      id,
    })
    if (!product) {
      throw new RpcNotFoundException(`product with id '${id}' was not found`)
    }

    return { product };
  }

  async findProductsByIds({ ids }: FindProductsByIdsRequest): Promise<FindProductsByIdsResponse> {
    const products = await this.productRepository.find({
      where :{
        id : In(ids)
      }
    })

    return { products }
  }

  async update({id, ...updateData}: UpdateProductDto) : Promise<UpdateProductResponse> {
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

    return { product };
  }

  async remove({ id }:DeleteOneProductRequest): Promise<void> {
    const product = await this.productRepository.findOneBy({id})
    if (!product) {
      throw new RpcNotFoundException(`product with id ${id} was not found`)
    }
    
    await this.productRepository.delete(id)
  }

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
