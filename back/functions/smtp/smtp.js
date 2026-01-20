import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

//Funció per obtenir la plantilla HTML i substituir les variables
function getTemplate(fileName, replacements) {
  const filePath = path.join(process.cwd(), "templates", fileName);
  let html = fs.readFileSync(filePath, "utf8");

  // Reemplaza {{variable}} por el valor real
  Object.keys(replacements).forEach((key) => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
  });

  return html;
}

export async function enviarEmail(type, userData) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST_SMTP,
    port: process.env.EMAIL_PORT_SMTP,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER_SMTP,
      pass: process.env.EMAIL_PASS_SMTP,
    },
  });

  // Definir l'assumpte i el contingut segons el tipus d'email
  let html;
  let subject;

  if (type === "benvinguda") {
    subject = "¡Benvingut a bord!";
    html = getTemplate("benvinguda.html", {
      nombre: userData.nombre,
      enlace: "https://www.winewithcola.com",
    });
  } else if (type === "recuperacion") {
    subject = "Recupera la teva contrasenya";
    html = getTemplate("password.html", { nombre: userData.nombre });
  }

  const mailOptions = {
    from: `"WineWithCola" <${process.env.EMAIL_USER_SMTP}>`,
    to: userData.email,
    subject: subject,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Enviat: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
}
