import mongoose, { Schema} from "mongoose";

enum ProductCategory {
  vestuario = 'vestuario',
  eletronicos = 'eletronicos',
  alimentos = 'alimentos'
}

export interface Product {
  name: string,
  price: number,
  category: 'vestuario' | 'eletronicos' | 'alimentos',
  inStock: boolean,
}

const ProductSchema = new Schema({
  name: {type: String, required: true},
  price: {type: Number, required: true},
  category: {type: String, enum: Object.values(ProductCategory), required: true},
  inStock: {type: Boolean, required: true},
}, {
  timestamps: true,
  versionKey: false,
 }
)

export const ProductModel = mongoose.model('Product', ProductSchema)
