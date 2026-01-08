import { fastify } from 'fastify';
import { productsRoute } from './routes/productRoutes.js';
import {
  serializerCompiler,
  validatorCompiler, 
} from 'fastify-type-provider-zod';

const app = fastify();

// app.get('/', async (request, reply) => {
//   return { hello: 'world' };
// });
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(productsRoute)

app.listen({port: 3030, host: '0.0.0.0'}).then(() => {
  console.log('Server is running on http://localhost:3030');
})