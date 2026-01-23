import { getPrisma } from "../functions/database/dbConn.js";
import { calcularPuntuacionesDelTaller } from "../functions/database/Criteris.js";

const prisma = await getPrisma();

async function analyzeData() {
  console.log("\n🔍 === ANÁLISIS DE DATOS SEED ===\n");

  // 1. Verificar talleres creados
  const tallers = await prisma.tallers.findMany({
    select: {
      id: true,
      nom: true,
      institucio: true,
      id_institucio: { select: { nom: true } },
    },
  });

  console.log("📋 TALLERES CREADOS:");
  tallers.forEach((t) => {
    console.log(
      `  ID ${t.id}: ${t.nom} (Institució: ${t.id_institucio.nom})`,
    );
  });

  // 2. Verificar inscripciones
  const inscripcions = await prisma.inscripcions.findMany({
    select: {
      id: true,
      institucio: true,
      primera_vegada: true,
      alumnes: true,
      tallerId: true,
      id_institucio: { select: { nom: true } },
    },
  });

  console.log("\n📝 INSCRIPCIONES CREADAS:");
  inscripcions.forEach((insc) => {
    const alumnes = JSON.parse(insc.alumnes || "[]");
    console.log(
      `  ID ${insc.id}: ${insc.id_institucio.nom} -> primera_vegada=${insc.primera_vegada}, tallerId=${insc.tallerId}`,
    );
    console.log(`    Alumnes JSON:`, alumnes);
  });

  // 3. Verificar históricos
  const historics = await prisma.historic.findMany({
    select: {
      id: true,
      id_institucio: true,
      periode: true,
      assistencia: true,
      id_institucio_rel: { select: { nom: true } },
    },
  });

  console.log("\n📚 HISTÓRICOS CREADOS:");
  historics.forEach((h) => {
    console.log(
      `  Institució ${h.id_institucio} (${h.id_institucio_rel.nom}): assistència=${h.assistencia}%`,
    );
  });

  console.log("\n");
}

async function testCriterisForAllTallers() {
  console.log("\n🧪 === TEST DE CRITERIOS POR TALLER ===\n");

  const tallers = await prisma.tallers.findMany({
    select: { id: true, nom: true },
  });

  for (const taller of tallers) {
    console.log(`\n📌 TALLER ID ${taller.id}: ${taller.nom}`);
    console.log("─".repeat(60));

    try {
      const resultado = await calcularPuntuacionesDelTaller(taller.id);

      console.log(`Plazas: ${resultado.taller.placesDisp}/${resultado.taller.placesMax}`);
      console.log(`\nInscripciones (${resultado.inscripciones.length}):`);

      for (const insc of resultado.inscripciones) {
        console.log(`\n  📄 Inscripción ID ${insc.id} - ${insc.institucion}`);
        console.log(`     Alumnos: ${insc.alumnos} | Puntuación: ${insc.puntuacion}`);
        console.log(`     Estado: ${insc.estat}`);
        console.log(`     Criterios aplicados:`);

        for (const criterio of insc.aceptadas) {
          const status = criterio.aplicat ? "✅ SÍ" : "❌ NO";
          console.log(
            `       ${status} ${criterio.criterio}: ${criterio.puntos > 0 ? "+" : ""}${criterio.puntos} puntos`,
          );
        }

        // Verificar si debería tener "primera vegada"
        const inscripcionDB = await prisma.inscripcions.findUnique({
          where: { id: insc.id },
          select: { institucio: true, primera_vegada: true },
        });

        const historic = await prisma.historic.findFirst({
          where: { id_institucio: inscripcionDB.institucio },
        });

        const deberiaSerPrimeraVegada = !historic;
        const esPrimeraVegadaDB = inscripcionDB.primera_vegada;

        console.log(`\n     🔎 VERIFICACIÓN PRIMERA VEGADA:`);
        console.log(`        En BD: ${esPrimeraVegadaDB}`);
        console.log(`        Debería ser: ${deberiaSerPrimeraVegada}`);
        console.log(`        Tiene histórico: ${!!historic}`);

        if (esPrimeraVegadaDB !== deberiaSerPrimeraVegada) {
          console.log(`        ⚠️  INCONSISTENCIA DETECTADA`);
        }
      }
    } catch (error) {
      console.error(`❌ Error al calcular taller ${taller.id}:`, error.message);
    }
  }
}

async function main() {
  try {
    await analyzeData();
    await testCriterisForAllTallers();

    console.log("\n\n📊 === RESUMEN DE PROBLEMAS DETECTADOS ===\n");
    
    const inscripcions = await prisma.inscripcions.findMany({
      select: {
        id: true,
        institucio: true,
        primera_vegada: true,
        id_institucio: { select: { nom: true } },
      },
    });

    let problemasDetectados = 0;

    for (const insc of inscripcions) {
      const historic = await prisma.historic.findFirst({
        where: { id_institucio: insc.institucio },
      });

      const deberiaSerPrimeraVegada = !historic;
      const esPrimeraVegadaDB = insc.primera_vegada;

      if (esPrimeraVegadaDB !== deberiaSerPrimeraVegada) {
        problemasDetectados++;
        console.log(
          `⚠️  Inscripción ${insc.id} (${insc.id_institucio.nom}): primera_vegada=${esPrimeraVegadaDB} pero ${historic ? "SÍ" : "NO"} tiene histórico`,
        );
      }
    }

    if (problemasDetectados === 0) {
      console.log("✅ No se detectaron inconsistencias");
    } else {
      console.log(`\n❌ Total de inconsistencias: ${problemasDetectados}`);
      console.log("\n💡 CAUSA RAÍZ:");
      console.log("   El seed crea las inscripciones con primera_vegada=true");
      console.log("   DESPUÉS crea los históricos.");
      console.log("   Por eso todas las inscripciones quedan marcadas como primera vez.");
      console.log("\n🔧 SOLUCIÓN:");
      console.log("   1. En seed.js: crear los históricos ANTES de las inscripciones");
      console.log("   2. O actualizar primera_vegada después de crear históricos");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
