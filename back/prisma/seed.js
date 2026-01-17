import { getPrisma } from "../functions/database/dbConn.js";

let prisma;

// Helper function para crear usuarios dummy
async function createDummyUser(rol, type) {
  const uniqueId = Math.floor(Math.random() * 1000000);
  const email = `user.${type}.${uniqueId}@test.com`;

  return await prisma.usuaris.create({
    data: {
      id: uniqueId + 10000,
      nom: `${type} User ${uniqueId}`,
      email: email,
      password: "123",
      telefon: 934512233,
      rol: rol,
      institucio: 1,
      autoritzat: true,
    },
  });
}

// Configuración
const workshopsData = [
  { name: "Robòtica", value: 45, year: "2023" },
  { name: "Teatre", value: 32, year: "2023" },
  { name: "Cuina", value: 28, year: "2023" },
  { name: "IA Generativa", value: 60, year: "2024" },
  { name: "Robòtica", value: 55, year: "2024" },
  { name: "Disseny 3D", value: 40, year: "2024" },
  { name: "Ciberseguretat", value: 75, year: "2025" },
  { name: "IA Generativa", value: 70, year: "2025" },
  { name: "Sostenibilitat", value: 50, year: "2025" },
];

// Dades institucions (Institucions NO tiene campo telefon en schema)
const institutionsData = [
  {
    name: "IES Joan Miró",
    direccio: "Carrer de València, 152",
    codi_postal: "08011",
  },
  {
    name: "Escola Politècnica",
    direccio: "Avinguda de la Universitat, 1",
    codi_postal: "17003",
  },
  {
    name: "Institut de Tecnologies",
    direccio: "Carrer de Sancho de Ávila, 52",
    codi_postal: "08018",
  },
  {
    name: "Centre Cívic Barri",
    direccio: "Plaça Major, 1",
    codi_postal: "08201",
  },
];

async function main() {
  prisma = await getPrisma();
  console.log("🔒 Iniciant seed en mode SEGUR (sense esborrar dades)...");

  /* -------------------------------------------------------------------------- */
  /* 1. PERIODES (Trimestres) - Comprovació abans de crear                      */
  /* -------------------------------------------------------------------------- */

  const periodsMap = {};
  const periodsDates = {};
  const years = ["2023", "2024", "2025"];

  for (const year of years) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-03-31T23:59:59.000Z`);

    // Busquem si ja existeix aquest període per dates
    let p = await prisma.periodes.findFirst({
      where: {
        dataIni: startDate,
        dataFi: endDate,
      },
    });

    if (!p) {
      p = await prisma.periodes.create({
        data: { dataIni: startDate, dataFi: endDate },
      });
      console.log(`✅ Període creat: ${year}`);
    } else {
      console.log(`ℹ️ Període existent: ${year}`);
    }

    periodsMap[year] = p.id;
    periodsDates[year] = { start: `01/01/${year}`, end: `31/03/${year}` };
  }

  /* -------------------------------------------------------------------------- */
  /* 2. USUARIS ADMIN (Upsert)                                                  */
  /* -------------------------------------------------------------------------- */

  // Utilitzem upsert: Si l'ID 1 existeix, no fa res (o actualitza). Si no, el crea.
  await prisma.usuaris.upsert({
    where: { email: "admin@sistema.com" }, // Busquem per unique
    update: {}, // No canviem res si ja existeix (per no resetear passwords reals)
    create: {
      id: 1, // Forcem ID 1 només si es crea de nou
      nom: "Super Admin",
      email: "admin@sistema.com",
      password: "123", // Hash en prod
      telefon: 934512233,
      rol: "Admin",
      institucio: 1, // Placeholder segur
      autoritzat: true,
    },
  });
  console.log("✅ Super Admin verificat.");

  /* -------------------------------------------------------------------------- */
  /* 3. INSTITUCIONS (Idempotent)                                               */
  /* -------------------------------------------------------------------------- */

  const createdInstitutions = [];

  for (const instData of institutionsData) {
    const responsableUser = await createDummyUser("Professorat", "Responsable");

    const newInst = await prisma.institucions.create({
      data: {
        nom: instData.name,
        responsable: responsableUser.id,
        codi_centre: `COD-${Math.floor(Math.random() * 10000)}`,
        direccio: instData.direccio,
        codi_postal: instData.codi_postal,
      },
    });
    createdInstitutions.push(newInst);
    console.log(`Institució creada: ${instData.name} (${instData.direccio})`);
  }

  /* -------------------------------------------------------------------------- */
  /* 4. TALLERS (Només si no existeixen)                                        */
  /* -------------------------------------------------------------------------- */

  // Nota per a Producció: Normalment no es vol "brossa" a les taules de tallers
  // en una app real, però si necessites aquestes dades per als gràfics:

  for (const workshop of workshopsData) {
    const periodId = periodsMap[workshop.year];

    // Busquem si existeix un taller amb el mateix nom en el mateix període
    const existingTaller = await prisma.tallers.findFirst({
      where: {
        nom: workshop.name,
        periode: periodId,
      },
    });

    if (!existingTaller) {
      const randomInst =
        createdInstitutions[
          Math.floor(Math.random() * createdInstitutions.length)
        ];

      // Creem admin per al taller
      const emailAdmin = `admin.${workshop.name.replace(/\s+/g, "")}.${
        workshop.year
      }@test.com`;
      let adminUser = await prisma.usuaris.findUnique({
        where: { email: emailAdmin },
      });
      if (!adminUser) {
        adminUser = await prisma.usuaris.create({
          data: {
            id: Math.floor(Math.random() * 100000) + 2000,
            nom: `Admin ${workshop.name}`,
            email: emailAdmin,
            password: "123",
            telefon: 934512233,
            rol: "Professorat",
            institucio: 1,
            autoritzat: true,
          },
        });
      }

      const horariJSON = {
        DATAINI: periodsDates[workshop.year].start,
        DATAFIN: periodsDates[workshop.year].end,
        TORNS: [
          {
            ID: 1,
            DIA: "Dilluns",
            HORAINICI: "09:00",
            HORAFI: "11:00",
          },
          {
            ID: 2,
            DIA: "Dimecres",
            HORAINICI: "10:00",
            HORAFI: "12:00",
          },
        ],
      };

      await prisma.tallers.create({
        data: {
          nom: workshop.name,
          descripcio: `Taller de ${workshop.name} (${workshop.year})`,
          institucio: randomInst.id,
          tallerista: `Tallerista ${workshop.name}`,
          places_max: workshop.value,
          places_disp: workshop.value,
          modalitat: "A",
          direccio: "Aula Principal",
          horari: JSON.stringify(horariJSON),
          periode: periodId,
          admin: adminUser.id,
          autoritzat: true,
        },
      });
      console.log(`✅ Taller creat: ${workshop.name} (${workshop.year})`);
    } else {
      console.log(`ℹ️ Taller existent: ${workshop.name} (${workshop.year})`);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 5. INSCRIPCIONS (Exemple amb alumnes en format JSON)                      */
  /* -------------------------------------------------------------------------- */

  // Obtenim els primers tallers creats per associar-los a inscripcions
  const allTallers = await prisma.tallers.findMany({ take: 3 });

  for (const taller of allTallers) {
    const inscripcioAlumnes = JSON.stringify([
      {
        TALLER: taller.id,
        TORN: 1,
        QUANTITAT: Math.floor(Math.random() * 10) + 1,
      },
    ]);

    try {
      await prisma.inscripcions.create({
        data: {
          institucio: taller.institucio,
          primera_vegada: Math.random() > 0.5,
          periode: taller.periode,
          alumnes: inscripcioAlumnes,
          referents: "Maria;Joan",
          docents_referents: "prof@test.com",
          comentari: `Inscripció per a ${taller.nom}`,
          documents: "document1.pdf",
          autoritzat: false,
          tallerId: taller.id,
        },
      });
      console.log(`✅ Inscripció creada per a taller: ${taller.nom}`);
    } catch (err) {
      console.log(`ℹ️ Inscripció existent o error per a taller ${taller.nom}`);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 6. ASSISTENCIA (Exemple amb alumnes i professors en format JSON)          */
  /* -------------------------------------------------------------------------- */

  for (const taller of allTallers) {
    const listaAlumnes = JSON.stringify([
      {
        NOM: "Manolo",
        INSTITUT: taller.institucio,
        ASSISTENCIA: true,
        JUSTIFICAT: false,
      },
      {
        NOM: "Clara",
        INSTITUT: taller.institucio,
        ASSISTENCIA: Math.random() > 0.5,
        JUSTIFICAT: false,
      },
    ]);

    const listaProfessors = JSON.stringify([
      {
        NOM: "Laura Pérez",
        ROL: "Professorat",
        ASSISTENCIA: true,
      },
      {
        NOM: "Joan Serra",
        ROL: "Professorat",
        ASSISTENCIA: Math.random() > 0.5,
      },
    ]);

    try {
      await prisma.assistencia.create({
        data: {
          id_taller: taller.id,
          dia: new Date(),
          llista_alumnes: listaAlumnes,
          llista_professors: listaProfessors,
          autoritzat: false,
        },
      });
      console.log(`✅ Assistència creada per a taller: ${taller.nom}`);
    } catch (err) {
      console.log(`ℹ️ Assistència existent o error per a taller ${taller.nom}`);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 7. HISTORIC (Registres de desempeño histórico)                             */
  /* -------------------------------------------------------------------------- */

  // Crear un registro de Historic por institución
  for (const institution of createdInstitutions) {
    try {
      await prisma.historic.create({
        data: {
          id_institucio: institution.id,
          periode: periodsMap["2025"], // Período más reciente
          assistencia: Math.random() * 100, // Porcentaje de asistencia entre 0-100
        },
      });
      console.log(`✅ Historic creat per a ${institution.nom}`);
    } catch (err) {
      console.log(`ℹ️ Historic existent o error per a ${institution.nom}`);
    }
  }

  console.log("Seed segur completat.");
}

main()
  .catch((e) => {
    console.error("Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
