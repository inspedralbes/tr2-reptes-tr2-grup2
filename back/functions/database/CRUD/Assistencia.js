import { getPrisma } from "../dbConn.js";

// SELECT totes les assistències
export async function getAllAssistencies() {
  try {
    const prisma = await getPrisma();
    return await prisma.assistencia.findMany({
      include: { taller: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir assistències: ${error.message}`);
  }
}

// SELECT una assistència per ID
export async function getAssistenciaById(id) {
  try {
    const prisma = getPrisma();
    return await prisma.assistencia.findUnique({
      where: { id },
      include: { taller: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir assistència: ${error.message}`);
  }
}

// INSERT nova assistència
export async function createAssistencia(data) {
  try {
    const prisma = getPrisma();
    return await prisma.assistencia.create({
      data,
      include: { taller: true },
    });
  } catch (error) {
    throw new Error(`Error al crear l'assistència: ${error.message}`);
  }
}

// UPDATE assistència
export async function updateAssistencia(data) {
  try {
    const prisma = getPrisma();
    const { id, ...updateData } = data;
    return await prisma.assistencia.update({
      where: { id },
      data: updateData,
      include: { taller: true },
    });
  } catch (error) {
    throw new Error(`Error al actualizar l'assistència: ${error.message}`);
  }
}

// DELETE assistència
export async function deleteAssistencia(id) {
  try {
    const prisma = getPrisma();
    return await prisma.assistencia.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error(`Error al eliminar l'assistència: ${error.message}`);
  }
}
