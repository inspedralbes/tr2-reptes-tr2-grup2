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
    const prisma = await getPrisma();
    return await prisma.assistencia.findUnique({
      where: { id: parseInt(id) },
      include: { taller: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir assistència: ${error.message}`);
  }
}

// SELECT assistències per taller ID
export async function getAssistenciesByTallerId(tallerId) {
  try {
    const prisma = await getPrisma();
    return await prisma.assistencia.findMany({
      where: { id_taller: parseInt(tallerId) },
      include: { taller: true },
      orderBy: { dia: 'asc' },
    });
  } catch (error) {
    throw new Error(`Error al obtenir assistències del taller: ${error.message}`);
  }
}

// INSERT nova assistència
export async function createAssistencia(data) {
  try {
    const prisma = await getPrisma();
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
    const prisma = await getPrisma();
    const { id, ...updateData } = data;
    return await prisma.assistencia.update({
      where: { id: parseInt(id) },
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
    const prisma = await getPrisma();
    return await prisma.assistencia.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new Error(`Error al eliminar l'assistència: ${error.message}`);
  }
}
