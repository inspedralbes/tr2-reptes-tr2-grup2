import { getPrisma } from "../functions/database/dbConn.js";

let prisma;

// Dades extretes del teu graficaTallers.vue
const workshopsData = [
  // 2023
  { name: "Robòtica", value: 45, year: "2023" },
  { name: "Teatre", value: 32, year: "2023" },
  { name: "Cuina", value: 28, year: "2023" },
  // 2024
  { name: "IA Generativa", value: 60, year: "2024" },
  { name: "Robòtica", value: 55, year: "2024" },
  { name: "Disseny 3D", value: 40, year: "2024" },
  // 2025
  { name: "Ciberseguretat", value: 75, year: "2025" },
  { name: "IA Generativa", value: 70, year: "2025" },
  { name: "Sostenibilitat", value: 50, year: "2025" },
];

// Dades extretes del teu graficaInstitucions.vue
// Dades extretes i actualitzades per al model Institucions
const institutionsData = [
  {
    name: "IES Joan Miró",
    direccio: "Carrer de València, 152",
    codi_postal: "08011",
    telefon: 934512233,
  },
  {
    name: "Escola Politècnica",
    direccio: "Avinguda de la Universitat, 1",
    codi_postal: "17003",
    telefon: 972418000,
  },
  {
    name: "Institut de Tecnologies",
    direccio: "Carrer de Sancho de Ávila, 52",
    codi_postal: "08018",
    telefon: 932210044,
  },
  {
    name: "Centre Cívic Barri",
    direccio: "Plaça Major, 1",
    codi_postal: "08201",
    telefon: 937250011,
  },
];

// Funció auxiliar per crear usuaris únics (necessari per les restriccions @unique de l'esquema)
let userIdCounter = 100;
async function createDummyUser(role, namePrefix) {
  userIdCounter++;
  return await prisma.usuaris.create({
    data: {
      id: userIdCounter,
      nom: `${namePrefix} ${userIdCounter}`,
      email: `user${userIdCounter}@test.com`,
      password: "123", // En producció fer servir hash
      rol: role,
      institucio: 1, // Placeholder, s'actualitzarà si és necessari
      autoritzat: true,
    },
  });
}

async function main() {
  prisma = await getPrisma();
  console.log("Iniciant neteja de la base de dades...");

  // Ordre important per evitar errors de Clau Forana (Foreign Key)
  await prisma.assistencia.deleteMany({});
  await prisma.inscripcions.deleteMany({});
  await prisma.tallers.deleteMany({});
  await prisma.institucions.deleteMany({});
  await prisma.usuaris.deleteMany({});

  console.log("Base de dades neta.");
  console.log("Sembrant dades...");

  /* -------------------------------------------------------------------------- */
  /* 1. INSTITUCIONS                                                            */
  /* -------------------------------------------------------------------------- */

  // Creem un Admin Global primer (id 1)
  await prisma.usuaris.create({
    data: {
      id: 1,
      nom: "Super Admin",
      email: "admin@sistema.com",
      password: "123",
      rol: "Admin",
      institucio: 1, // ID temporal
      autoritzat: true,
    },
  });

  const createdInstitutions = [];

  for (const instData of institutionsData) {
    const responsableUser = await createDummyUser("Professorat", "Responsable");

    const newInst = await prisma.institucions.create({
      data: {
        nom: instData.name,
        tipus: "CentreEducatiu",
        responsable: responsableUser.id,
        contacte: `contacte@${instData.name
          .replace(/\s+/g, "")
          .toLowerCase()}.cat`,
        codi_centre: `COD-${Math.floor(Math.random() * 10000)}`,
        direccio: instData.direccio,
        codi_postal: instData.codi_postal,
        telefon: instData.telefon,
      },
    });
    createdInstitutions.push(newInst);
    console.log(`Institució creada: ${instData.name} (${instData.direccio})`);
  }

  /* -------------------------------------------------------------------------- */
  /* 2. TALLERS                                                                 */
  /* -------------------------------------------------------------------------- */

  for (const workshop of workshopsData) {
    // Assignem el taller aleatòriament a una de les institucions creades
    // perquè la gràfica d'institucions també tingui dades.
    const randomInst =
      createdInstitutions[
        Math.floor(Math.random() * createdInstitutions.length)
      ];

    // Cada taller necessita un tallerista ÚNIC segons el teu esquema
    const talleristaUser = await createDummyUser("Extern", "Tallerista");

    await prisma.tallers.create({
      data: {
        nom: workshop.name,
        descripcio: `Taller de ${workshop.name} impartit l'any ${workshop.year}`,
        target: "Dilluns", // Valor per defecte de l'enum
        institucio: randomInst.id,
        tallerista: talleristaUser.id,
        // Utilitzem 'value' del gràfic com a capacitat màxima per simular la dada
        places_max: workshop.value,
        places_disp: 0, // 0 disponibles significa que està ple (value = inscrits)
        duracio: 60,
        modalitat: "A",
        direccio: "Aula Principal",
        horari: "17:00 - 18:00",
        curs: workshop.year, // Aquí guardem "2023", "2024" o "2025"
        autoritzat: true,
      },
    });
    console.log(
      ` Taller creat: ${workshop.name} (${workshop.year}) - Alumnes: ${workshop.value}`
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 3. INSCRIPCIONS                                                            */
  /* -------------------------------------------------------------------------- */
  // Crear algunes inscripcions per omplir dades, tot i que els gràfics fan servir Tallers/Institucions

  if (createdInstitutions.length > 0) {
    const coordUser = await createDummyUser("Professorat", "Coordinador");

    // Intentem crear una inscripció vinculada a la primera institució
    // Nota: El teu esquema diu que 'institucio' a Inscripcions és @unique,
    // així que només hi pot haver 1 inscripció per institució.
    await prisma.inscripcions.create({
      data: {
        institucio: createdInstitutions[0].id,
        coordinador: coordUser.id,
        primera_vegada: false,
        trimestre: "Primer",
        alumnes: JSON.stringify([{ nom: "Alumne 1" }, { nom: "Alumne 2" }]),
        referents: "Direcció",
        docents_referents: "docent@test.com",
        comentari: "Tot correcte",
        documents: "http://drive...",
        autoritzat: true,
      },
    });
    console.log(`Inscripció creada per a: ${createdInstitutions[0].nom}`);
  }

  console.log("Seed completat amb èxit.");
}

main()
  .catch((e) => {
    console.error("Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
