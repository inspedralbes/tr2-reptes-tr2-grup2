import { getPrisma } from "../dbConn.js";

// SELECT totes les institucions
export async function getAllInstitucions() {
  try {
    const prisma = await getPrisma();
    return await prisma.institucions.findMany({
      include: { tallers: true, institucions: true, usuaris: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir institucions: ${error.message}`);
  }
}

// SELECT una institució per ID
export async function getInstitucioById(id) {
  try {
    const prisma = await getPrisma();
    return await prisma.institucions.findUnique({
      where: { id: parseInt(id) },
      include: { tallers: true, institucions: true, usuaris: true },
    });
  } catch (error) {
    throw new Error(`Error al obtenir institució: ${error.message}`);
  }
}

export async function getInstitucioByCodiCentre(codi_centre) {
  try {
    const prisma = await getPrisma();
    const institucionFinder = await prisma.institucions.findUnique({
      where: { codi_centre: codi_centre },
    });

    if (institucionFinder) return institucionFinder;
    return false;
  } catch (error) {
    console.error("Error completo:", error);
    console.error("Código de error Prisma:", error.code);
    throw new Error(`Error al obtenir institució: ${error.message}`);
  }
}

// INSERT nova institució
export async function createInstitucio(data) {
  try {
    const prisma = await getPrisma();
    return await prisma.institucions.create({
      data,
      include: { usuaris: true },
    });
  } catch (error) {
    throw new Error(`Error al crear institució: ${error.message}`);
  }
}

// UPDATE institució
export async function updateInstitucio(data) {
  try {
    const prisma = await getPrisma();
    const { id, ...updateData } = data;
    return await prisma.institucions.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { usuaris: true },
    });
  } catch (error) {
    throw new Error(`Error al actualitzar institució: ${error.message}`);
  }
}

// DELETE institució
export async function deleteInstitucio(id) {
  try {
    const prisma = await getPrisma();
    return await prisma.institucions.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new Error(`Error al eliminar institució: ${error.message}`);
  }
}
