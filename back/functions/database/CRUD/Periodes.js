import { getPrisma } from "../dbConn.js";

// SELECT totes les periodes
export async function getAllPeriodes() {
  try {
    const prisma = await getPrisma();
    return await prisma.periodes.findMany();
  } catch (error) {
    throw new Error(`Error al obtenir periodes: ${error.message}`);
  }
}
