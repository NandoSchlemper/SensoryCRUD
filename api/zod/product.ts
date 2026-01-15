import {z} from 'zod'

// arrumarndo
const productSchema = z.object({
  id: z.uuid(),
  name: z.string().min(3).max(100),
  price: z.number().positive(),
  category: z.enum(['eletronicos', 'vestuario', 'alimentos']),
  inStock: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const ProductError400Schema = z.object({
  error: z.string(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string()
  }))
})

export const ProductErrorSchema = z.object({
  error: z.string()
})

export const ProductGETPaginationSuccessSchema = z.object({
  success: z.boolean(),
  data: z.array(productSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean().optional(), 
    hasPreviousPage: z.boolean().optional() 
  }),
  metadata: z.object({
    requestId: z.string(),
    processingTime: z.number()
  })
})