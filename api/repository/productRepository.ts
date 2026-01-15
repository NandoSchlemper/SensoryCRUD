import { Product, ProductModel } from "../models/product.js";


export interface IProductRepository {
  findById(id: string): Promise<Product|null>
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>
}

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    return await ProductModel.findById(id).lean()
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    const created = new ProductModel(product)
    const saved = await created.save()
    console.log(saved.toJSON())
    return saved.toObject()
  }
}