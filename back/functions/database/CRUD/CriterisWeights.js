import { getPrisma } from "../dbConn.js";

// SELECT todos los pesos de criterios
export async function getAllCriterisWeights() {
  try {
    const prisma = await getPrisma();
    return await prisma.criterisWeights.findMany();
  } catch (error) {
    throw new Error(`Error al obtener pesos de criterios: ${error.message}`);
  }
}

// SELECT peso de criterio específico
export async function getCriterisWeightById(id) {
  try {
    const prisma = await getPrisma();
    return await prisma.criterisWeights.findUnique({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new Error(`Error al obtener peso de criterio: ${error.message}`);
  }
}

// SELECT por nombre de criterio
export async function getCriterisWeightByCriterio(criterio) {
  try {
    const prisma = await getPrisma();
    return await prisma.criterisWeights.findUnique({
      where: { criterio },
    });
  } catch (error) {
    throw new Error(
      `Error al obtener peso para criterio ${criterio}: ${error.message}`
    );
  }
}

// UPDATE peso de criterio
export async function updateCriterisWeight(id, newPeso) {
  try {
    const prisma = await getPrisma();
    return await prisma.criterisWeights.update({
      where: { id: parseInt(id) },
      data: { peso: parseInt(newPeso) },
    });
  } catch (error) {
    throw new Error(`Error al actualizar peso de criterio: ${error.message}`);
  }
}

// SELECT pesos para un período específico (o globales)
export async function getCriterisWeightsForPeriod(periodeId) {
  try {
    const prisma = await getPrisma();
    // Obtener pesos globales y específicos del período
    const weights = await prisma.criterisWeights.findMany({
      where: {
        OR: [
          { periode: null }, // Pesos globales
          { periode: parseInt(periodeId) }, // Pesos específicos del período
        ],
      },
    });
    return weights;
  } catch (error) {
    throw new Error(
      `Error al obtener pesos para el período: ${error.message}`
    );
  }
}
