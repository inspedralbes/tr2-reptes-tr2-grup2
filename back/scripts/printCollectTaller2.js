import { collectInscripcionsByTaller } from "../functions/database/Criteris.js";

async function main() {
  try {
    const results = await collectInscripcionsByTaller(1);
    console.log(JSON.stringify(results, null, 1));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
