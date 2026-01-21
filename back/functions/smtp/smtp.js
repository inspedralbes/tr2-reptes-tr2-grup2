import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, ".env") });

export async function enviarEmail(type, userData) {
  let html;
  let subject;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST_SMTP,
    port: process.env.EMAIL_PORT_SMTP,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER_SMTP,
      pass: process.env.EMAIL_PASS_SMTP,
    },
  });

  let mailOptions;

  switch (type) {
    case "registre":
      subject = "Sollicitud de registre a GesTallers";
      html = getTemplate("registre.html", {
        nom: userData.nom,
        id: userData.id,
        email: userData.email,
        url: `${process.env.API_URL}`,
      });
      mailOptions = {
        from: `"GesTaller" <${process.env.EMAIL_USER_SMTP}>`,
        to: "a22tonmarmar@inspedralbes.cat",
        subject: subject,
        html: html,
      };
      break;
    case "registreAcceptat":
      subject = "Aceptació de registre a GesTallers";
      html = getTemplate("registre_aceptat.html", {
        nom: userData.nom,
        url: `${process.env.URL_BASE}`,
      });
      mailOptions = {
        from: `"GesTaller" <${process.env.EMAIL_USER_SMTP}>`,
        to: "a22tonmarmar@inspedralbes.cat",
        subject: subject,
        html: html,
      };
      break;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Enviat: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
}

function getTemplate(fileName, replacements) {
  const filePath = path.join(__dirname, "templates", fileName);
  let html = fs.readFileSync(filePath, "utf8");
  console.log("Template loaded from:", filePath);
  // Reemplaza {{variable}} por el valor real
  Object.keys(replacements).forEach((key) => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
  });

  return html;
}
