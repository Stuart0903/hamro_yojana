import {PrismaClient} from "../../generated/prisma/client.ts";
import dotenv from "dotenv";
import {Pool} from "pg";
import {PrismaPg} from "@prisma/adapter-pg";
dotenv.config();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({adapter});

