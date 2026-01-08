import { fechaLimite } from "../functions/database/Criteris.js";

async function main() {
  const tallerId = process.argv[2] ?? "1";
  try {
    const result = await fechaLimite(tallerId);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(
      "Error ejecutando fechaLimite:",
      err && err.message ? err.message : err
    );
    process.exit(1);
  }
}

main();
