// back/functions/auth.js
// Autenificador de contrasenyes utilitzant bcryptjs
// Exporta funcions per hashear i comparar contrasenyes

import bcrypt from "bcryptjs";

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePassword(password, hashedPassword) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}
