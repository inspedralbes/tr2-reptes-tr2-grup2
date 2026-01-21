import { getPrisma } from "../dbConn.js";

export async function getSystemSettings() {
  const prisma = await getPrisma();
  
  let settings = await prisma.systemSettings.findFirst({
    include: {
      periode: true,
    },
  });

  if (!settings) {
    const periodes = await prisma.periodes.findMany({
      orderBy: { dataIni: "desc" },
    });

    if (periodes.length === 0) {
      throw new Error("No hay periodes disponibles");
    }

    settings = await prisma.systemSettings.create({
      data: {
        selectedPeriodeId: periodes[0].id,
      },
      include: {
        periode: true,
      },
    });
  }

  return settings;
}

export async function updateSystemSettings(selectedPeriodeId) {
  const prisma = await getPrisma();

  const settings = await prisma.systemSettings.update({
    where: { id: 1 },
    data: {
      selectedPeriodeId: parseInt(selectedPeriodeId),
    },
    include: {
      periode: true,
    },
  });

  return settings;
}
