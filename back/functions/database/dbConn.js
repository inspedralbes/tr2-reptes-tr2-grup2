import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});

let prismaInstance;

export const getPrisma = async () => {
  if (!prismaInstance) {
    try {
      prismaInstance = new PrismaClient({ adapter });

      await prismaInstance.$connect();
      console.log("Conexió establerta amb la base de dades.");
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  return prismaInstance;
};
