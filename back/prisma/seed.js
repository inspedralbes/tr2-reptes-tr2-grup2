import { getPrisma } from "../functions/database/dbConn.js";

let prisma;

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
        dataFi: endDate
      }
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
        curs: periodId
      }
    });

    if (!existingTaller) {
      const randomInst = createdInstitutions[Math.floor(Math.random() * createdInstitutions.length)];
      
      // Creem tallerista només si cal
      const emailTallerista = `tallerista.${workshop.name.replace(/\s+/g, "")}.${workshop.year}@test.com`;
      
      // Intentem buscar el tallerista o crear-lo
      let talleristaUser = await prisma.usuaris.findUnique({ where: { email: emailTallerista }});
      if (!talleristaUser) {
         talleristaUser = await prisma.usuaris.create({
            data: {
                id: Math.floor(Math.random() * 100000) + 2000,
                nom: `Tallerista ${workshop.name}`,
                email: emailTallerista,
                password: "123",
                rol: "Extern",
                institucio: 1,
                autoritzat: true
            }
         });
      }

      const horariJSON = {
        "DATAINI": periodsDates[workshop.year].start,
        "DATAFIN": periodsDates[workshop.year].end,
        "TORNS": [{ "ID": 1, "DIA": "Dilluns", "HORAINICI": "17:00", "HORAFI": "18:00" }]
      };

      await prisma.tallers.create({
        data: {
          nom: workshop.name,
          descripcio: `Taller de ${workshop.name} (${workshop.year})`,
          target: "Dilluns",
          institucio: randomInst.id,
          tallerista: talleristaUser.id,
          places_max: workshop.value,
          places_disp: 0,
          duracio: 60,
          modalitat: "A",
          direccio: "Aula Principal",
          horari: JSON.stringify(horariJSON),
          curs: periodId,
          autoritzat: true,
        },
      });
      console.log(`✅ Taller creat: ${workshop.name} (${workshop.year})`);
    } else {
        console.log(`ℹ️ Taller existent: ${workshop.name} (${workshop.year})`);
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