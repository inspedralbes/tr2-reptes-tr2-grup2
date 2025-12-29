import { getPrisma } from "../dbConn.js";

// SELECT tots els usuaris
export async function getAllUsuaris() {
  try {
    const prisma = getPrisma();
    return await prisma.usuaris.findMany({
      include: { tallers: true, responsable: true, coordinador: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir usuaris: ${error.message}`);
  }
}

// SELECT un usuari per ID
export async function getUsuariById(id) {
  try {
    const prisma = getPrisma();
    return await prisma.usuaris.findUnique({
      where: { id },
      include: { tallers: true, responsable: true, coordinador: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir usuari: ${error.message}`);
  }
}

// INSERT nou usuari
export async function createUsuari(data) {
  try {
    const prisma = getPrisma();
    return await prisma.usuaris.create({
      data,
      include: { tallers: true, responsable: true, coordinador: true },
    });
  } catch (error) {
    throw new Error(`Error al crear usuari: ${error.message}`);
  }
}

// UPDATE usuari
export async function updateUsuari(data) {
  try {
    const prisma = getPrisma();
    const { id, ...updateData } = data;
    return await prisma.usuaris.update({
      where: { id },
      data: updateData,
      include: { tallers: true, responsable: true, coordinador: true },
    });
  } catch (error) {
    throw new Error(`Error al actualizar usuari: ${error.message}`);
  }
}

// DELETE usuari
export async function deleteUsuari(id) {
  try {
    const prisma = getPrisma();
    return await prisma.usuaris.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error(`Error al eliminar usuari: ${error.message}`);
  }
}
