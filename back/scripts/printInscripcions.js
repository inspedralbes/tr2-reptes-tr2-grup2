import { getAllInscripcions } from "../functions/database/CRUD/Inscripcions.js";

function safeParse(str) {
  try {
    return str ? JSON.parse(str) : null;
  } catch (e) {
    return str; // return original string if not valid JSON
  }
}

async function main() {
  const inscripcions = await getAllInscripcions();

  const parsed = inscripcions.map((i) => ({
    ...i,
    alumnes: safeParse(i.alumnes),
    referents: safeParse(i.referents),
  }));

  console.log(JSON.stringify(parsed, null, 2));
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
