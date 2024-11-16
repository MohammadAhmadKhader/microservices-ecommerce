import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductProtobuf } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { FindAllResponse, FindProductsByIdsResponse } from '@ms/common/generated/products'
import { createConsumer, createDLQConsumer } from './broker';
import { BrokerService } from '@ms/common/modules/broker/broker.service';
import { UpdateStocksParams } from './types/types';
import { RpcException } from '@nestjs/microservices';
@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(@InjectRepository(Product) private productRepository: Repository<Product>){}

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

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = await this.productRepository.save(createProductDto)
    return product;
  }

  async findAll(page:number, limit:number): Promise<FindAllResponse> {
    const skip = page * limit
    const [products, count] = await this.productRepository.findAndCount({
      order:{
        createdAt:-1
      },
      take:limit,
      skip:skip
    })

    const productsProtobufs = products.map((product)=>{
      return new ProductProtobuf(product)
    })

    return {page, limit, count:count,products:productsProtobufs as any};
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({
      id,
    })
    if (!product) {
      throw new RpcException(`product with id '${id}' was not found`)
    }
   
    const productResponse = product.ConvertToProtobufType()
    return productResponse as any;
  }

  async findProductsByIds(Ids: number[]): Promise<FindProductsByIdsResponse> {
    const products = await this.productRepository.find({
      where :{
        id : In(Ids)
      }
    })

    const protobufsProducts = products.map((prod)=>{
      return prod.ConvertToProtobufType()
    }) 

    return {products: protobufsProducts as unknown as Product[]}
  }

  async update(id: number, updateProductDto: Partial<UpdateProductDto>) : Promise<Product> {
    const product = await this.productRepository.findOneBy({id})
    if (!product) {
      throw new NotFoundException(`product with id ${id} was not found`)
    }
    
    Object.assign(product, updateProductDto)
    await this.productRepository.save(product)

    return product;
  }

  async remove(id: number): Promise<void> {
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
          throw new RpcException(`product with id: '${prod.id}' has quantity: '${prod.quantity}' which less than the requested amount: '${prodIdQtyMap[prod.id]}'`)
        }
        existingIdMap[prod.id] = prod
      })
      const lostIds = []
      productsIds.forEach((id)=>{
        if(!existingIdMap[id]) {
          lostIds.push(id)
        }
      })

      throw new RpcException(`products with following id were not exist: ${lostIds.join(", ")}`)
    }
    
    const updateRes = await this.productRepository
    .createQueryBuilder().update(Product).set({
      quantity: ()=> `CASE ${caseStatements} ELSE quantity END`
    }).whereInIds(productsIds).execute()

    return updateRes
  }
}
