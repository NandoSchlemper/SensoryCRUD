import {z} from "zod";

const envSchema = z.object({
  MONGO_DB_USERNAME: z.string(),
  MONGO_DB_PASSWORD: z.string(),  
  MONGO_DB_URL: z.url(),
})

const env = envSchema.parse(process.env)
export default env