import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { fakeDatabase } from "./productsFakeData.js";
import { ProductError400Schema, ProductErrorSchema, ProductGETPaginationSuccessSchema } from "../zod/product.js";

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
        tags: ['products'], // praq q serve isso?
        querystring: PaginationSchema,
        // headers: z.object({
        //   'y-z-x-api-key-hehe-lul-kekw': z.string().optional()
        // }),
        response: {
          200: ProductGETPaginationSuccessSchema,
          400: ProductError400Schema,
          401: ProductErrorSchema,
          500: ProductErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const startTime = Date.now()
      const requestId = `req_123`
      const {page, limit, search} = request.query;

      const filteredProducts = filterProducts(fakeDatabase, search)
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
      const total = filteredProducts.length
      const totalPages = Math.ceil(total/limit)
      
      const processingTime = Date.now() - startTime
      try {
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
          error: "Erro interno do servidor :("
        });
      }
    }
  );
};

// Caso for colocar em PROD é legal ter os metadados das requisições:
// const apikey = request.headers['y-z-x-api-key-hehe-lul-kekw'];
// const ipaddr = request.ip;
// const httpMethod = request.method
// const url = request.url

// app.log.info({
//   requestId,
//   method: httpMethod,
//   url,
//   ip: ipaddr,
//   query: request.query,
//   // headers: {'y-z-x-api-key-hehe-lul-kekw': apikey ? '****': 'none'},
// }, 'Requisição Recebida');
// if (!apikey) {
//   return reply.status(401).send({
//     error: "API Key é obrigatória para continuar bro... wtf are u doing?"
//   })
// }