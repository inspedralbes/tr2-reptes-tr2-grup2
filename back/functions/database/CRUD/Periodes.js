import { getPrisma } from "../dbConn.js";

export async function getAllPeriodes() {
  const prisma = await getPrisma();

  return await prisma.periodes.findMany({
    orderBy: { dataIni: "asc" },
  });
}

export async function createPeriode(dataIni, dataFi) {
  const prisma = await getPrisma();

  return await prisma.periodes.create({
    data: {
      dataIni: new Date(dataIni),
      dataFi: new Date(dataFi),
    },
  });
}
