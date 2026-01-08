import mongoose, {Date, Schema} from "mongoose";

interface IProduct {
  name: string,
  price: number,
  category: 'eletronicos' | 'vestuario' | 'alimentos',
  inStock: boolean,
  createdAt: Date,
  updatedAt: Date,
}

const ProductSchema = new Schema<IProduct>({
  name: {type: String, required: true},
  price: {type: Number, required: true},
  category: {type: String, required: true},
  inStock: {type: Boolean, required: true},
  createdAt: {type: Date, required: true},
  updatedAt: {type: Date, default: Date.now(), required: true}
}, {
  timestamps: true,
  versionKey: false,
 }
)

export default mongoose.model<IProduct>('Product', ProductSchema);
