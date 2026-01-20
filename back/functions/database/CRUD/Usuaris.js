import { getPrisma } from "../dbConn.js";

// SELECT tots els usuaris
export async function getAllUsuaris() {
  try {
    const prisma = await getPrisma();
    return await prisma.usuaris.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        rol: true,
        tallers: true,
        responsable: true,
      },
    });
  } catch (error) {
    throw new Error(`Error al obtenir usuaris: ${error.message}`);
  }
}

// SELECT un usuari per ID
export async function getUsuariById(id) {
  try {
    const prisma = await getPrisma();
    return await prisma.usuaris.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nom: true,
        email: true,
        rol: true,
        tallers: true,
        responsable: true,
        responsable: true,
      },
    });
  } catch (error) {
    throw new Error(`Error al obtenir usuari: ${error.message}`);
  }
}

// INSERT nou usuari
export async function createUsuari(data) {
  try {
    const prisma = await getPrisma();
    return await prisma.usuaris.create({
      data,
      include: { tallers: true, responsable: true },
    });
  } catch (error) {
    throw new Error(`Error al crear usuari: ${error.message}`);
  }
}

// UPDATE usuari
export async function updateUsuari(data) {
  try {
    const prisma = await getPrisma();
    const { id, ...updateData } = data;
    return await prisma.usuaris.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { tallers: true, responsable: true },
    });
  } catch (error) {
    throw new Error(`Error al actualizar usuari: ${error.message}`);
  }
}

// DELETE usuari
export async function deleteUsuari(id) {
  try {
    const prisma = await getPrisma();
    return await prisma.usuaris.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new Error(`Error al eliminar usuari: ${error.message}`);
  }
}

// GET usuari per ID (sense relacions, per login)
export async function getUsuariForAuth(id) {
  try {
    const prisma = await getPrisma();
    return await prisma.usuaris.findUnique({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new Error(`Error al obtenir usuari per auth: ${error.message}`);
  }
}

// UPDATE token de l'usuari
export async function updateUsuariToken(id, token) {
  try {
    const prisma = await getPrisma();
    return await prisma.usuaris.update({
      where: { id: parseInt(id) },
      data: { token },
    });
  } catch (error) {
    throw new Error(`Error al actualizar token: ${error.message}`);
  }
}
