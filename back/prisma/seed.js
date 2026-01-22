import { getPrisma } from "../functions/database/dbConn.js";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

let prisma;

// 1. Periodes Fixos
const customPeriods = [
  { start: "2025-09-12", end: "2025-12-22", name: "Tardor 2025" },
  { start: "2026-01-08", end: "2026-03-27", name: "Hivern 2026" },
  { start: "2026-04-09", end: "2026-05-22", name: "Primavera 2026" },
  { start: "2026-09-12", end: "2026-12-22", name: "Tardor 2026" },
  { start: "2027-01-08", end: "2027-03-27", name: "Hivern 2027" },
  { start: "2027-04-09", end: "2027-05-22", name: "Primavera 2027" },
];

// Dades de tallers
const workshopsData = [
  { name: "Robòtica Avançada", value: 45 },
  { name: "Teatre Social", value: 32 },
  { name: "IA Generativa", value: 60 },
  { name: "Ciberseguretat", value: 75 },
];

async function main() {
  prisma = await getPrisma();
  console.log(
    "🚀 [INICI] Seed Adaptat v4: Schema nou (Institucions independents)...",,
  );

  const periodsIds = [];

  /* -------------------------------------------------------------------------- */
  /* 1. PERIODES                                                                */
  /* -------------------------------------------------------------------------- */
  console.log("📅 [1/6] Creant Periodes...");
  for (const pData of customPeriods) {
    const dInicio = new Date(`${pData.start}T00:00:00.000Z`);
    const dFin = new Date(`${pData.end}T23:59:59.000Z`);

    // Busquem o creem
    let p = await prisma.periodes.findFirst({ where: { dataIni: dInicio } });
    if (!p) {
      p = await prisma.periodes.create({
        data: { dataIni: dInicio, dataFi: dFin },
      });
    }
    periodsIds.push(p.id);
  }

  /* -------------------------------------------------------------------------- */
  /* 2. INSTITUCIÓ 1: CONSORCI D'EDUCACIÓ                                       */
  /* -------------------------------------------------------------------------- */
  console.log("🏢 [2/6] Creant Institució Principal (Consorci)...");

  // Ara podem crear la institució directament sense necessitar un usuari responsable
  // Intentem crear-la o buscar-la.
  let consorciInst = await prisma.institucions.findFirst({
    where: { codi_centre: "CONSORCI-001" },
  });

  if (!consorciInst) {
    consorciInst = await prisma.institucions.create({
      data: {
        // Com que és autoincrement, normalment serà l'ID 1 si la BD està buida.
        nom: "Consorci d'Educació de Barcelona",
        codi_centre: "CONSORCI-001",
        direccio: "Plaça Urquinaona, 6",
        codi_postal: "08010",
      },
    });
    console.log(`   ✅ Consorci creat (ID: ${consorciInst.id})`);
  } else {
    console.log(`   ℹ️ Consorci ja existent (ID: ${consorciInst.id})`);
  }

  const ID_CONSORCI = consorciInst.id;

  /* -------------------------------------------------------------------------- */
  /* 3. USUARIS ADMINS (SuperAdmin + 2 Consorci)                                */
  /* -------------------------------------------------------------------------- */
  console.log("👤 [3/6] Creant Usuaris Admin vinculats al Consorci...");

  // Nota: Ara 'id' és autoincrement, no el passem manualment.

  // 3.1 Super Admin
  await prisma.usuaris.upsert({
    where: { email: "admin@sistema.com" },
    update: {}, // Si existeix no toquem res
    create: {
      nom: "Super Admin",
      email: "admin@sistema.com",
      password: "123",
      telefon: 934512233,
      rol: "Admin",
      institucio: ID_CONSORCI,
      autoritzat: true,
    },
  });

  // 3.2 Staff Consorci
  const consorciAdmins = [
    { nom: "Director Consorci", email: "director@consorci.cat" },
    { nom: "Admin Consorci", email: "admin@consorci.cat" },
  ];

  for (const admin of consorciAdmins) {
    await prisma.usuaris.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        nom: admin.nom,
        email: admin.email,
        password: "123",
        telefon: 934000001,
        rol: "Admin",
        institucio: ID_CONSORCI,
        autoritzat: true,
      },
    });
  }
  console.log("   ✅ Admins creats.");

  /* -------------------------------------------------------------------------- */
  /* 4. IMPORTAR CSV (Institucions + 10 Profes VIP)                             */
  /* -------------------------------------------------------------------------- */
  console.log("🏢 [4/6] Important CSV (Totes les institucions)...");

  const vipInstitutions = []; // Guardarem les 10 primeres
  const csvFilePath = path.join(
    process.cwd(),
    "prisma",
    "totcat-centres-educatius.csv",
  );

  if (fs.existsSync(csvFilePath)) {
    const fileStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let isHeader = true;
    let count = 0;

    for await (const line of rl) {
      if (isHeader) {
        isHeader = false;
        continue;
      }

      const cols = line.split(";");
      const codiCentre = cols[0]?.trim();
      const nomCentre = cols[1]?.trim();
      const direccio = cols[6]?.trim();
      const codiPostal = cols[7]?.trim();

      if (!codiCentre || !nomCentre) continue;

      try {
        // 4.1 Creem la Institució (ara és independent)
        // Usem findFirst per codi_centre per evitar duplicats
        let inst = await prisma.institucions.findFirst({
          where: { codi_centre: codiCentre },
        });

        if (!inst) {
          inst = await prisma.institucions.create({
            data: {
              codi_centre: codiCentre,
              nom: nomCentre,
              direccio: direccio || "Desconeguda",
              codi_postal: codiPostal || "00000",
              // Ja no cal el camp 'responsable' aquí!
            },
          });
          count++;
          if (count % 200 === 0) process.stdout.write(".");
        }

        // 4.2 Lògica VIP: Si és una de les 10 primeres, creem el seu Professor
        if (vipInstitutions.length < 10) {
          // Evitem afegir duplicats a l'array vip si el seed es reexecuta
          if (!vipInstitutions.find((v) => v.id === inst.id)) {
            vipInstitutions.push(inst);

            const emailProfesor = `profesor.${codiCentre}@xtec.cat`;

            // Creem l'usuari professor vinculat a aquesta institució
            await prisma.usuaris.upsert({
              where: { email: emailProfesor },
              update: {},
              create: {
                nom: `Profesor - ${nomCentre}`.substring(0, 50),
                email: emailProfesor,
                password: "123",
                telefon: 930000000,
                rol: "Professorat",
                institucio: inst.id, // <--- Vinculem l'usuari a la institució
                autoritzat: true,
              },
            });

            console.log(
              `   🌟 [VIP] Institució i Profesor creats: ${nomCentre}`,
            );
          }
        }
      } catch (err) {
        // console.error(`Error fila CSV: ${err.message}`);
      }
    }
    console.log(
      `\n   ✅ Importació CSV finalitzada. Total processats: ${count}`,
    );
    console.log(
      `   ✅ Institucions VIP seleccionades: ${vipInstitutions.length}`,
    );
  } else {
    console.error("   ⛔ NO S'HA TROBAT EL CSV.");
  }

  /* -------------------------------------------------------------------------- */
  /* 5. GENERAR DADES (TALLERS I INSCRIPCIONS PER A VIPs)                       */
  /* -------------------------------------------------------------------------- */
  console.log("🛠️ [5/6] Generant Talleres (Només per a les 10 VIP)...");

  // Necessitem un ID d'admin per crear els tallers. Usem el de 'admin@sistema.com'
  const superAdmin = await prisma.usuaris.findUnique({
    where: { email: "admin@sistema.com" },
  });
  const adminId = superAdmin ? superAdmin.id : 1;

  let i = 0;
  for (const workshop of workshopsData) {
    // Assignació rotativa determinista
    const inst = vipInstitutions[i % vipInstitutions.length];
    const period = periodsIds[i % periodsIds.length];
    i++;

    if (!inst) continue;

    try {
      // Crear Taller
      const taller = await prisma.tallers.create({
        data: {
          nom: workshop.name,
          descripcio: "Activitat educativa (Seed)",
          institucio: inst.id,
          tallerista: "Tallerista Expert",
          places_max: workshop.value,
          places_disp: workshop.value,
          modalitat: "A",
          direccio: inst.direccio,
          horari: JSON.stringify({
            DATAINI: "2025-09-05",
            DATAFI: "2025-12-22",
            TORNS: [{ DIA: "Dilluns", HORAINICI: "10:00", HORAFI: "12:00" }],
          }),
          periode: period,
          admin: adminId,
          autoritzat: true,
        },
      });

      // Crear Inscripció
      await prisma.inscripcions.create({
        data: {
          institucio: inst.id,
          primera_vegada: true,
          periode: period,
          alumnes: JSON.stringify([
            { TALLER: taller.id, QUANTITAT: 15, ESTAT: "ESPERA" },
          ]),
          referents: "Cap d'Estudis",
          docents_referents: "docent@centre.cat",
          autoritzat: true,
          tallerId: taller.id,
        },
      });

      // Crear Assistència Dummy
      await prisma.assistencia.create({
        data: {
          id_taller: taller.id,
          dia: new Date(),
          llista_alumnes: JSON.stringify([
            { NOM: "Alumne 1", INSTITUT: inst.id, ASSISTENCIA: true, JUSTIFICAT: true },
          ]),
          llista_professors: JSON.stringify([
            { NOM: "Profe 1", INSTITUT: inst.id, ASSISTENCIA: true, JUSTIFICAT: flase },
          ]),
          autoritzat: false,
        },
      });
    } catch (e) {
      /* Ignorem errors de duplicats en rellançar */
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 6. HISTÒRIC (SOLO PARA VIPs)                                               */
  /* -------------------------------------------------------------------------- */
  console.log("📚 [6/6] Generant Històric...");

  let assistencia = 80;
  for (const inst of vipInstitutions) {
    assistencia = (assistencia + 1) % 100;
    try {
      await prisma.historic.create({
        data: {
          id_institucio: inst.id,
          periode: periodsIds[0],
          assistencia: assistencia,
        },
      });
    } catch (e) {}
  }
  console.log("\n🚀 [6/7] Creant pesos de criterios...");
  const pesos = [
    { criterio: "FIRST_TIME", peso: 20 },
    { criterio: "ATTENDANCE_RISK", peso: -30 },
    { criterio: "DIVERSITY", peso: 15 },
    { criterio: "NO_CAPACITY", peso: -30 },
    { criterio: "NE", peso: 30 },
  ];

  for (const p of pesos) {
    const existe = await prisma.criterisWeights.findUnique({
      where: { criterio: p.criterio },
    });
    if (!existe) {
      await prisma.criterisWeights.create({
        data: {
          criterio: p.criterio,
          peso: p.peso,
          periode: null, // Aplica globalmente
        },
      });
    }
  }

  console.log("\n🏁 [FIN] Seed completat correctament.");
}

main()
  .catch((e) => {
    console.error("❌ ERROR CRÍTIC:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
