import { getPrisma } from "../dbConn.js";

// SELECT tots els tallers
export async function getAllTallers() {
  try {
    const prisma = getPrisma();
    return await prisma.tallers.findMany({
      include: {
        id_institucio: true,
        id_tallerista: true,
        llista_assistencia: true,
      },
    });
  } catch (error) {
    throw new Error(`Error al obtenir tallers: ${error.message}`);
  }
}

// SELECT un taller per ID
export async function getTallerById(id) {
  try {
    const prisma = getPrisma();
    return await prisma.tallers.findUnique({
      where: { id },
      include: {
        id_institucio: true,
        id_tallerista: true,
        llista_assistencia: true,
      },
    });
  } catch (error) {
    throw new Error(`Error al obtenir taller: ${error.message}`);
  }
}

// INSERT nou taller
export async function createTaller(data) {
  try {
    const prisma = getPrisma();
    return await prisma.tallers.create({
      data,
      include: { id_institucio: true, id_tallerista: true },
    });
  } catch (error) {
    throw new Error(`Error al crear taller: ${error.message}`);
  }
}

// UPDATE taller
export async function updateTaller(data) {
  try {
    const prisma = getPrisma();
    const { id, ...updateData } = data;
    return await prisma.tallers.update({
      where: { id },
      data: updateData,
      include: { id_institucio: true, id_tallerista: true },
    });
  } catch (error) {
    throw new Error(`Error al actualitzar taller: ${error.message}`);
  }
}

// DELETE taller
export async function deleteTaller(id) {
  try {
    const prisma = getPrisma();
    return await prisma.tallers.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error(`Error al eliminar taller: ${error.message}`);
  }
}
