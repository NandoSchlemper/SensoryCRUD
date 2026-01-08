import { IProduct, Product } from "../models/product.js"

type ProductDTO = Omit<IProduct, 'updatedAt' | 'createdAt'>

export default interface IProductRepository {
  saveBook: (product: ProductDTO) => Promise<IProduct>
}

export default class ProductRepository implements IProductRepository {
  private ProductCollection: Product 
}