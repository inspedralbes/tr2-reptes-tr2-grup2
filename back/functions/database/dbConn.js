import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

let prismaInstance;

export const getPrisma = async () => {
  if (!prismaInstance) {
    try {
      console.log("Iniciando Prisma v7 con configuración...");
      // Forzamos un objeto de opciones para evitar el error de "constructor vacío"
      prismaInstance = new PrismaClient({ adapter });

      await prismaInstance.$connect();
      console.log("✅ Conexión establecida con MySQL.");
    } catch (error) {
      console.error("❌ Error al conectar Prisma:", error);
      throw error;
    }
  }
  return prismaInstance;
};
