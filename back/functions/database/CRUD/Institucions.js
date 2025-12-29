import { getPrisma } from "../dbConn.js";

// SELECT totes les institucions
export async function getAllInstitucions() {
  try {
    const prisma = getPrisma();
    return await prisma.institucions.findMany({
      include: { id_responsable: true, tallers: true, institucions: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir institucions: ${error.message}`);
  }
}

// SELECT una institució per ID
export async function getInstitucioById(id) {
  try {
    const prisma = getPrisma();
    return await prisma.institucions.findUnique({
      where: { id },
      include: { id_responsable: true, tallers: true, institucions: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir institució: ${error.message}`);
  }
}

// INSERT nova institució
export async function createInstitucio(data) {
  try {
    const prisma = getPrisma();
    return await prisma.institucions.create({
      data,
      include: { id_responsable: true },
    });
  } catch (error) {
    throw new Error(`Error al crear institució: ${error.message}`);
  }
}

// UPDATE institució
export async function updateInstitucio(data) {
  try {
    const prisma = getPrisma();
    const { id, ...updateData } = data;
    return await prisma.institucions.update({
      where: { id },
      data: updateData,
      include: { id_responsable: true },
    });
  } catch (error) {
    throw new Error(`Error al actualitzar institució: ${error.message}`);
  }
}

// DELETE institució
export async function deleteInstitucio(id) {
  try {
    const prisma = getPrisma();
    return await prisma.institucions.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error(`Error al eliminar institució: ${error.message}`);
  }
}
