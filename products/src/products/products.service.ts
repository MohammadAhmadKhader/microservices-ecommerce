import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductProtobuf } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { FindAllResponse, FindProductsByIdsResponse } from '../../generated/products'
@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private productRepository: Repository<Product>){}
  
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
   
    const productResponse = product!.ConvertToProtobufType()
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
}
