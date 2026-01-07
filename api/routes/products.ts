import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { fakeDatabase } from "./productsFakeData.js";

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

const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1), // tem q converter p number
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional()
});

// isso aq é pra eu me acostumar com as praticas estranhas de filtro de arquivo em JS
const filterProducts = ((products: typeof fakeDatabase, search?: string) => {
  if (!search) return products;

  return products.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase()) || 
    product.category.includes(search.toLowerCase()))
});

export const productsRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/products',
    {
      schema: {
        summary: "Obter produtos com filtragem paginada.",
        description: "Retorna uma lista paginada com todos os produtos com possibilidade de busca.",
        tags: ['products'], // tenho q ver praq q serve isso dps
        querystring: PaginationSchema,
        headers: z.object({
          'y-z-x-api-key-hehe-lul-kekw': z.string().optional() // me arrependi de ter feito isso
        }),
        response: {
          200: z.object({
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
          }),
          400: z.object({
            error: z.string(),
            details: z.array(z.object({
              field: z.string(),
              message: z.string()
            }))
          }),
          401: z.object({
            error: z.string()
          }),
          500: z.object({
            error: z.string()
          })
        },
      },
    },
    async (request, reply) => {
      const startTime = Date.now()
      const requestId = `req_123`

      try {
        const {page, limit, search} = request.query;
        const apikey = request.headers['y-z-x-api-key-hehe-lul-kekw'];
        const ipaddr = request.ip;
        const httpMethod = request.method
        const url = request.url

        app.log.info({
          requestId,
          method: httpMethod,
          url,
          ip: ipaddr,
          query: request.query,
          headers: {'y-z-x-api-key-hehe-lul-kekw': apikey ? '****': 'none'},
        }, 'Requisição Recebida');

        if (!apikey) {
          return reply.status(401).send({
            error: "API Key é obrigatória para continuar bro... wtf are u doing?"
          })
        }

        const filteredProducts = filterProducts(fakeDatabase, search)
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
        const total = filteredProducts.length
        const totalPages = Math.ceil(total/limit)
        
        const processingTime = Date.now() - startTime

        reply.header('X-Request-Id', requestId)
        reply.header('X-Processing-Time', `${processingTime}ms`)
        reply.header('X-Total-Count', total.toString())
      
        return reply.status(200).send({
          success: true,
          data: paginatedProducts,
          pagination: {
            page,
            limit,
            total, 
            totalPages, 
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          },
          metadata: {
            requestId,
            processingTime // minúsculo p o r r a
          }
        });
      } catch (error) {
        const processingTime = Date.now() - startTime;
        
        app.log.error({
          requestId,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          processingTime
        }, 'Erro ao processar requisição');
        
        return reply.status(500).send({
          error: "Erro interno do servidor, porra."
        });
      }
    }
  );
};