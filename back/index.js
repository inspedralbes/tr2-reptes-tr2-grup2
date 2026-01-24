/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import {
  comparePassword,
  generateTokens,
  verifyRefreshToken,
  secretKey,
  hashPassword,
} from "./functions/auth.js";
import { enviarEmail } from "./functions/smtp/smtp.js";
import {
  getUsuariForAuth,
  updateUsuariToken,
  getUserId,
} from "./functions/database/CRUD/Usuaris.js";
import { getInscripciosByTallerId } from "./functions/database/CRUD/Inscripcions.js";
import { calcularPuntuacionesDelTaller } from "./functions/database/Criteris.js";
import {
  getAllCriterisWeights,
  getCriterisWeightById,
  getCriterisWeightByCriterio,
  updateCriterisWeight,
  getCriterisWeightsForPeriod,
} from "./functions/database/CRUD/CriterisWeights.js";
import { reloadWeights } from "./functions/database/Criteris.js";
import {
  getSystemSettings,
  updateSystemSettings,
} from "./functions/database/CRUD/SystemSettings.js";
import {
  getAllPeriodes,
  createPeriode as createPeriodeDB,
} from "./functions/database/CRUD/Periodes.js";
import { getInstitucioByCodiCentre } from "./functions/database/CRUD/Institucions.js";
import { getUsuariByEmail } from "./functions/database/CRUD/Usuaris.js";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */
dotenv.config();
const app = express();
const port = process.env.PORT;

console.log("Hola pokiwokie");

/* -------------------------------------------------------------------------- */
/*                                 SERVER APP                                 */
/* -------------------------------------------------------------------------- */
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */

/* --------------------------------- EXAMPLE -------------------------------- */

// Definir una ruta d'exemple
app.get("/", (req, res) => {
  res.send("Hello World! XDDDDDDDDDDDDDDD");
});

/* ---------------------------------- AUTH ---------------------------------- */

// Ruta de login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await getUsuariByEmail(email, true);

    if (!existingUser) {
      return res
        .status(409)
        .json({ error: "Ja existeix un usuari amb el correu donat." });
    }

    if (!existingUser.autoritzat) {
      return res.status(403).json({ error: "Usuari no autoritzat" });
    }

    const comparingPassword = await comparePassword(
      password,
      existingUser.password,
    );

    if (!comparingPassword) {
      return res.status(400).json({ error: "Contrasenya incorrecta" });
    }

    const { accessToken, refreshToken } = generateTokens(existingUser);
    await updateUsuariToken(parseInt(existingUser.id), refreshToken);

    res.status(200).json({
      message: "Login correcte",
      accessToken,
      refreshToken,
      user: existingUser,
    });
  } catch (error) {
    console.error("Error de base de dades:", error);
    res.status(500).json({ error: "Error de base de dades: " + error.message });
  }
});

// Ruta de registre
app.post("/register", async (req, res) => {
  const { nom, email, password, rol, responsable } = req.body;

  if (!nom || !email || !password) {
    return res
      .status(400)
      .json({ error: "Falten camps obligatoris (nom, email, password)" });
  }

  try {
    const existingUser = await getUsuariByEmail(email, false);
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Ja existeix un usuari amb el correu donat." });
    }

    const codi_centre = responsable.codi_centre;
    if (!codi_centre) {
      return res.status(400).json({
        error: "Falta el codi del centre a la informació de responsable.",
      });
    }
    const existingInstitucio = await getInstitucioByCodiCentre(codi_centre);
    if (existingInstitucio === false) {
      return res
        .status(409)
        .json({ error: "No existeix una institució amb el codi donat." });
    }

    const hashedPassword = await hashPassword(password);

    await createUsuari({
      nom,
      email,
      password: hashedPassword,
      rol: rol || "Professorat",
      autoritzat: false,
      institucio: existingInstitucio.id,
      telefon: 0,
      responsable: true,
    });

    enviarEmail("registre", { nom, email, id: await getUserId(email) });

    res.status(201).json({
      message: "Petició d'usuari registrat correctament",
    });
  } catch (error) {
    console.error("Error al registrar usuari:", error);
    res
      .status(500)
      .json({ error: "Error al registrar l'usuari: " + error.message });
  }
});

// Ruta de refresh token
app.post("/refresh", async (req, res) => {
  const { refreshToken, userId } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Token requerit" });
  }

  try {
    // Verifica que el token emmagatzemat en BD coincideixi
    const user = await getUsuariForAuth(parseInt(userId));

    if (!user || user.token !== refreshToken) {
      return res.status(403).json({ error: "Token invàlid" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = jwt.sign(
      { id: decoded.id, nom: decoded.nom, rol: decoded.rol },
      secretKey,
      { expiresIn: "1h" },
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Error en refresh:", err);
    res.status(403).json({ error: "Token invàlid o expirat" });
  }
});

// Ruta de logout
app.post("/logout", async (req, res) => {
  const { userId } = req.body;

  try {
    await updateUsuariToken(parseInt(userId), null);

    res.json({ message: "Logout correcte" });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ error: "Error en logout" });
  }
});

/* ------------------------------- MULTER ------------------------------ */

import uploadImages from "./functions/uploads/images.cjs";
import uploadOthers from "./functions/uploads/others.cjs";

app.post("/uploadImage", uploadImages.single("file"), (req, res) => {
  if (req.file) {
    const filename = Date.now() + path.extname(req.file.originalname);
    const filePath = path.join("./files/images", filename);
    fs.writeFileSync(filePath, req.file.buffer);
    req.file.filename = filename;
  }
  res.json({ message: "Imatge Pujada", file: req.file });
});

app.post("/uploadOther", uploadOthers.single("file"), (req, res) => {
  res.json({ message: "Arxiu Pujat", file: req.file });
});

app.use("/files/images", express.static("./files/images"));
app.use("/files/archives", express.static("./files/archives"));

/* ------------------------------- ASSISTENCIA ------------------------------ */

import {
  getAllAssistencies,
  getAssistenciaById,
  getAssistenciesByTallerId,
  createAssistencia,
  updateAssistencia,
  deleteAssistencia,
} from "./functions/database/CRUD/Assistencia.js";

app.get("/assistencies", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const assistencies = await getAllAssistencies();
  res.json(assistencies);
});

app.get("/assistencies/taller/:tallerId", async (req, res) => {
  const { tallerId } = req.params;
  const assistencies = await getAssistenciesByTallerId(tallerId);
  res.json(assistencies);
});

app.get("/assistencies/:id", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const { id } = req.params;
  const assistencia = await getAssistenciaById(id);
  res.json(assistencia);
});

app.post("/assistencies", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const data = req.body;
  const newAssistencia = await createAssistencia(data);
  res.json(newAssistencia);
});

app.put("/assistencies", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const data = req.body;
  const updatedAssistencia = await updateAssistencia(data);
  res.json(updatedAssistencia);
});
app.delete("/assistencies/:id", async (req, res) => {
  const { id } = req.params;
  const deletedAssistencia = await deleteAssistencia(id);
  res.json(deletedAssistencia);
});

// Afegir alumnes i profesorat a l'assistència
// {
//   "institucioId": 1,
//   "tallerID": 1,
//   "alumnesAfegir": [
//     "Paco Hernandez",
//     "Manolito MM"
//   ],
//   "profesAfegir": [
//     "Prof. López",
//     "MAMDAMDMA"
//   ]
// }
app.put("/assistencies/afegirPersonal", async (req, res) => {
  const { institucioId, tallerID, alumnesAfegir, profesAfegir } = req.body;
  try {
    if (!institucioId || !tallerID) {
      return res.status(400).json({
        error: "Falten paràmetres obligatoris (institucioId, tallerID)",
      });
    }

    // Obtenir totes les assistències del taller
    const assistencias = await getAssistenciesByTallerId(tallerID);

    if (!assistencias || assistencias.length === 0) {
      return res.status(404).json({
        error: "No s'han trobat assistències per aquest taller",
      });
    }

    // Convertir arrays de strings a objectes amb format complet
    const alumnesFormatejats =
      alumnesAfegir && Array.isArray(alumnesAfegir)
        ? alumnesAfegir.map((nom) => ({
            NOM: typeof nom === "string" ? nom : nom.NOM,
            INSTITUT: institucioId,
            ASSISTENCIA: true,
            JUSTIFICAT: false,
          }))
        : [];

    const profesFormatejats =
      profesAfegir && Array.isArray(profesAfegir)
        ? profesAfegir.map((nom) => ({
            NOM: typeof nom === "string" ? nom : nom.NOM,
            INSTITUT: institucioId,
            ASSISTENCIA: true,
            JUSTIFICAT: false,
          }))
        : [];

    for (const assistencia of assistencias) {
      let llista_alumnes = JSON.parse(assistencia.llista_alumnes || "[]");
      let llista_professors = JSON.parse(assistencia.llista_professors || "[]");

      // Esborrar tots els alumnos/profes de la mateixa institució
      llista_alumnes = llista_alumnes.filter(
        (alumne) => alumne.INSTITUT !== institucioId,
      );
      llista_professors = llista_professors.filter(
        (profe) => profe.INSTITUT !== institucioId,
      );

      // Afegir els nous alumnes
      llista_alumnes = llista_alumnes.concat(alumnesFormatejats);

      // Afegir els nous profes
      llista_professors = llista_professors.concat(profesFormatejats);

      // Actualitzar l'assistència
      await updateAssistencia({
        id: assistencia.id,
        llista_alumnes: JSON.stringify(llista_alumnes),
        llista_professors: JSON.stringify(llista_professors),
      });
    }

    res.status(200).json({
      message: "Alumnes i profes afegits correctament a les assistències",
      tallerID,
      institucioId,
      alumnesAfegits: alumnesFormatejats.length,
      profesAfegits: profesFormatejats.length,
    });
  } catch (error) {
    console.error("Error al afegir alumnes a l'assistència:", error);
    res.status(500).json({
      error: "Error al afegir alumnes: " + error.message,
    });
  }
});

/* ------------------------------- HISTORIC ------------------------------ */

import {
  getAllHistoric,
  getHistoricByInstitucion,
  createHistoric,
  deleteHistoric,
} from "./functions/database/CRUD/Historic.js";

app.get("/historic", async (req, res) => {
  try {
    const historic = await getAllHistoric();
    res.json(historic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/historic/institucion/:institucion", async (req, res) => {
  try {
    const { institucion } = req.params;
    const historic = await getHistoricByInstitucion(institucion);
    res.json(historic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/historic", async (req, res) => {
  try {
    const { idInstitucion, periode, assistencia } = req.body;
    const result = await createHistoric(idInstitucion, periode, assistencia);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/historic/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteHistoric(id);
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------- INSCRIPCIONS ------------------------------ */

import {
  getAllInscripcions,
  getInscripcioById,
  createInscripcio,
  updateInscripcio,
  deleteInscripcio,
  procesarInscripcio,
  updateEstatInscripcions,
  getInscripcionsByPeriode,
} from "./functions/database/CRUD/Inscripcions.js";

app.get("/inscripcions", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const inscripcions = await getAllInscripcions();
  res.json(inscripcions);
});

app.get("/inscripcions/:id", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const { id } = req.params;
  const inscripcio = await getInscripcioById(id);
  res.json(inscripcio);
});

app.post("/inscripcions", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const data = req.body;
  const newInscripcio = await createInscripcio(data);
  res.json(newInscripcio);
});

app.post("/inscripcions/dadesinsc", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  try {
    const { selecciones, "docents-ref": docentRef, comentari } = req.body;

    // Paula: validando que selecciones sea un array no vacío
    if (!Array.isArray(selecciones) || selecciones.length === 0) {
      return res.status(400).json({
        message: "selecciones debe ser un array no vacío",
      });
    }

    // Paula: llamando a la función que procesa las inscripciones
    const resultado = await procesarInscripcio(
      selecciones,
      docentRef || null,
      comentari || null,
    );

    return res.status(200).json({
      ok: true,
      message: "Inscripcions procesades correctament",
      data: resultado,
    });
  } catch (err) {
    console.error("Error en /inscripcions/dadesinsc:", err.message);
    return res.status(500).json({
      message: `Error al procesar inscripcions: ${err.message}`,
    });
  }
});

// Procesar inscripcions i crear assistències
// {
//   "periode": 3
// }
app.post("/inscripcions/procesar", async (req, res) => {
  try {
    const { periode } = req.body;

    // Obternir totes les inscripcions per periode
    const inscripcions = await getInscripcionsByPeriode(periode);

    // Processar inscripcions per a cada taller
    for (const inscripcio of inscripcions) {
      // Verificar que cap alumne estigui en estat "ESPERA"
      if (inscripcio.alumnes) {
        try {
          const alumnes = JSON.parse(inscripcio.alumnes);

          for (const alumne of alumnes) {
            if (alumne.ESTAT === "ESPERA") {
              return res.status(400).json({
                error:
                  "No es pot processar: existeixen alumnes en estat ESPERA",
                inscripcioId: inscripcio.id,
                alumneEnEspera: alumne,
              });
            }
          }
        } catch (parseError) {
          console.error("Error al parsejar alumnes JSON:", parseError);
          return res.status(400).json({
            error: "Format invàlid en camp alumnes",
            inscripcioId: inscripcio.id,
          });
        }
      }
    }

    // Obtenir tots els tallers del període
    const tallers = await getTallersByPeriode(periode);

    for (const taller of tallers) {
      try {
        const horari = JSON.parse(taller.horari);

        // Validar que horari té estructura correcta amb TORNS
        if (!horari.TORNS || !Array.isArray(horari.TORNS)) {
          console.warn(
            `Horari no té estructura correcta per taller ${taller.id}:`,
            horari,
          );
          continue;
        }

        const dataIni = new Date(horari.DATAINI);
        const dataFi = new Date(horari.DATAFI);

        // Generar dates per a cada dia de la setmana especificat en TORNS
        for (const torn of horari.TORNS) {
          const diaSemana = torn.DIA;

          // Mapejar nom del dia a índex (0=diumenge, 1=dilluns, etc.)
          const diesSetmana = {
            Diumenge: 0,
            Dilluns: 1,
            Dimarts: 2,
            Dimecres: 3,
            Dijous: 4,
            Divendres: 5,
            Dissabte: 6,
          };

          const indexDia = diesSetmana[diaSemana];

          if (indexDia === undefined) {
            console.warn(
              `Dia no reconegut: ${diaSemana} per taller ${taller.id}`,
            );
            continue;
          }

          // Generar totes les dates dins del periode que siguin d'aquest dia de la setmana
          let dataActual = new Date(dataIni);
          while (dataActual <= dataFi) {
            if (dataActual.getDay() === indexDia) {
              await createAssistencia({
                id_taller: taller.id,
                dia: new Date(dataActual),
                llista_alumnes: JSON.stringify([]),
                llista_professors: JSON.stringify([]),
                autoritzat: false,
              });
            }
            dataActual.setDate(dataActual.getDate() + 1);
          }
        }

        // Actualizar taller a autorizado después de crear las asistencias
        await updateTaller({
          id: taller.id,
          autoritzat: true,
        });
      } catch (parseError) {
        console.error(
          `Error processant horari del taller ${taller.id}:`,
          parseError,
        );
        continue;
      }
    }

    res.status(200).json({ message: "Assistències creades correctament" });
  } catch (error) {
    console.error("Error al crear assistències:", error);
    res
      .status(500)
      .json({ error: "Error al crear assistències: " + error.message });
  }
});

// Confirmar inscripcions per a un taller
app.post("/inscripcions/confirmar", async (req, res) => {
  try {
    const { tallerId, inscripcionesAprobadas } = req.body;

    if (!tallerId || !inscripcionesAprobadas?.length) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    await updateEstatInscripcions(inscripcionesAprobadas, tallerId);
    res.status(200).json({ message: "Inscripciones confirmadas" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/inscripcions", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const data = req.body;
  const updatedInscripcio = await updateInscripcio(data);
  res.json(updatedInscripcio);
});

app.delete("/inscripcions/:id", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const { id } = req.params;
  const deletedInscripcio = await deleteInscripcio(id);
  res.json(deletedInscripcio);
});

/* ------------------------------- INSTITUCIONS ------------------------------ */

import {
  getAllInstitucions,
  getInstitucioById,
  createInstitucio,
  updateInstitucio,
  deleteInstitucio,
} from "./functions/database/CRUD/Institucions.js";

app.get("/institucions", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const institucions = await getAllInstitucions();
  res.json(institucions);
});

app.get("/institucions/:id", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const { id } = req.params;
  const institucio = await getInstitucioById(id);
  res.json(institucio);
});

app.post("/institucions", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const data = req.body;
  const newInstitucio = await createInstitucio(data);
  res.json(newInstitucio);
});

app.put("/institucions", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const data = req.body;
  const updatedInstitucio = await updateInstitucio(data);
  res.json(updatedInstitucio);
});

app.delete("/institucions/:id", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const { id } = req.params;
  const deletedInstitucio = await deleteInstitucio(id);
  res.json(deletedInstitucio);
});

/* ------------------------------- TALLERS ------------------------------ */

import {
  getAllTallers,
  getTallerById,
  createTaller,
  updateTaller,
  deleteTaller,
  getTallersByPeriode,
  addComentariProfe,
} from "./functions/database/CRUD/Tallers.js";

app.get("/tallers", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const { periode } = req.query;

  let tallers;
  if (periode) {
    tallers = await getTallersByPeriode(periode);
  } else {
    tallers = await getAllTallers();
  }

  res.json(tallers);
});

app.get("/tallers/:id", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const { id } = req.params;
  const taller = await getTallerById(id);
  res.json(taller);
});

app.post("/tallers", uploadImages.single("imatge"), async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  try {
    const data = req.body;

    // Validaciones básicas
    if (
      !data.nom ||
      !data.descripcio ||
      !data.tallerista ||
      !data.mailTallerista ||
      !data.direccio ||
      !data.horari ||
      !data.periode ||
      !data.admin
    ) {
      return res.status(400).json({
        error:
          "Falten camps obligatoris (nom, descripcio, tallerista, mailTallerista, direccio, horari, periode, admin)",
      });
    }

    // Convertir camps numèrics i booleans
    data.places_max = parseInt(data.places_max);
    data.places_disp = parseInt(data.places_disp);
    data.periode = parseInt(data.periode);
    data.institucio = parseInt(data.institucio);
    data.admin = parseInt(data.admin);
    data.autoritzat = data.autoritzat === "true" || data.autoritzat === true;

    let filename;
    if (req.file) {
      filename = Date.now() + path.extname(req.file.originalname);
      data.imatge = `/files/images/${filename}`;
    } else {
      data.imatge = "/files/images/example.png";
    }

    const newTaller = await createTaller(data);

    if (req.file) {
      const filePath = path.join("./files/images", filename);
      fs.writeFileSync(filePath, req.file.buffer);
    }

    res.status(201).json(newTaller);
  } catch (error) {
    console.error("Error al crear taller:", error);
    res.status(500).json({ error: error.message || "Error al crear taller" });
  }
});

app.put("/tallers", uploadImages.single("imatge"), async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  try {
    const data = req.body;

    // Convertir camps numèrics i booleans
    data.places_max = parseInt(data.places_max);
    data.places_disp = parseInt(data.places_disp);
    data.periode = parseInt(data.periode);
    data.institucio = parseInt(data.institucio);
    data.admin = parseInt(data.admin);
    data.autoritzat = data.autoritzat === "true" || data.autoritzat === true;

    let filename;
    let oldImagePathToDelete;

    // Actualitzar imatge si s'ha pujat una nova
    if (req.file) {
      filename = Date.now() + path.extname(req.file.originalname);
      data.imatge = `/files/images/${filename}`;

      const tallerActual = await getTallerById(data.id);
      if (tallerActual && tallerActual.imatge) {
        oldImagePathToDelete = tallerActual.imatge;
      }
    }

    const updatedTaller = await updateTaller(data);

    if (req.file) {
      const filePath = path.join("./files/images", filename);
      fs.writeFileSync(filePath, req.file.buffer);

      // Eliminar la imatge antiga si no és la d'exemple
      if (oldImagePathToDelete) {
        const oldImageName = oldImagePathToDelete.replace("/files/images/", "");
        const fullPath = path.join("./", "files", "images", oldImageName);

        if (oldImageName !== "example.png" && fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    res.json(updatedTaller);
  } catch (error) {
    console.error("Error al actualitzar taller:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al actualitzar taller" });
  }
});

app.delete("/tallers", async (req, res) => {
  try {
    const { id } = req.body;
    const tallerActual = await getTallerById(id);

    // Eliminar la imatge si existeix i no és la d'exemple
    if (tallerActual && tallerActual.imatge) {
      const imageName = tallerActual.imatge.replace("/files/images/", "");
      const fullPath = path.join("./files/images", imageName);

      if (imageName !== "example.png" && fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    const deletedTaller = await deleteTaller(id);
    res.json(deletedTaller);
  } catch (error) {
    console.error("Error al eliminar taller:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al eliminar taller" });
  }
});

app.get("/tallers/:id/inscripcions", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  try {
    const { id } = req.params;
    const inscripcions = await getInscripciosByTallerId(id);
    res.json(inscripcions);
  } catch (error) {
    console.error("Error al obtenir inscripcions del taller:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al obtenir inscripcions" });
  }
});

app.get("/tallers/:id/inscripcions-ordenadas", async (req, res) => {
  // Pa afuera, que no hace falta el token aquí
  // const token = req.headers.authorization.split(" ")[1];
  // if (!token) {
  //   return res.status(401).json({ error: "Token requerit" });
  // }
  try {
    const { id } = req.params;
    const resultado = await calcularPuntuacionesDelTaller(id);
    res.json(resultado);
  } catch (error) {
    console.error("Error al obtenir inscripcions ordenadas:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al obtenir inscripcions" });
  }
});

app.delete("/tallers/:id", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const { id } = req.params;
  const deletedTaller = await deleteTaller(id);
  res.json(deletedTaller);
});

app.post("/tallers/:id/comentari-profe", async (req, res) => {
  try {
    const { id } = req.params;
    const { idInstitucio, comentari } = req.body;

    if (!idInstitucio || !comentari) {
      return res.status(400).json({ error: "Falten idInstitucio i comentari" });
    }

    const resultado = await addComentariProfe(id, idInstitucio, comentari);
    res.status(200).json({
      ok: true,
      message: "Comentari guardat correctament",
      data: resultado,
    });
  } catch (error) {
    console.error("Error en /tallers/:id/comentari-profe:", error.message);
    res.status(500).json({
      error: error.message || "Error al guardar comentari",
    });
  }
});

/* ------------------------------- USUARIS ------------------------------ */

import {
  getAllUsuaris,
  getUsuariById,
  createUsuari,
  updateUsuari,
  deleteUsuari,
} from "./functions/database/CRUD/Usuaris.js";

app.get("/usuaris", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const usuaris = await getAllUsuaris();
  res.json(usuaris);
});

app.get("/usuaris/:id", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerit" });
  }
  const { id } = req.params;
  const usuari = await getUsuariById(id);
  res.json(usuari);
});

app.get("/usuaris/aceptat/:id", async (req, res) => {
  let data = req.body;
  const id = req.params.id;
  data = { ...data, autoritzat: true };
  try {
    await updateUsuari(id, data);
    enviarEmail("registreAcceptat", { nom: data.nom, email: data.email });
    return res.json({
      message: "Usuari acceptat correctament",
    });
  } catch (error) {
    return res.json({ message: "Error al actualizar usuari:", error });
  }
});

app.get("/usuaris/denegat/:id", async (req, res) => {
  const { id } = req.params;
  const deletedUsuari = await deleteUsuari(id);
  res.json(deletedUsuari);
});

/* ------------------------------- CRITERIS WEIGHTS ------------------------------ */

app.get("/criteris-weights", async (req, res) => {
  try {
    const weights = await getAllCriterisWeights();
    res.json(weights);
  } catch (error) {
    console.error("Error al obtener pesos de criterios:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/criteris-weights/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const weight = await getCriterisWeightById(id);
    res.json(weight);
  } catch (error) {
    console.error("Error al obtener peso de criterio:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/criteris-weights/criterio/:criterio", async (req, res) => {
  try {
    const { criterio } = req.params;
    const weight = await getCriterisWeightByCriterio(criterio);
    res.json(weight);
  } catch (error) {
    console.error("Error al obtener peso por criterio:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/criteris-weights/periodo/:periodeId", async (req, res) => {
  try {
    const { periodeId } = req.params;
    const weights = await getCriterisWeightsForPeriod(periodeId);
    res.json(weights);
  } catch (error) {
    console.error("Error al obtener pesos del período:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/criteris-weights/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { peso } = req.body;

    if (peso === undefined) {
      return res.status(400).json({ error: "El campo 'peso' es requerido" });
    }

    const updatedWeight = await updateCriterisWeight(id, peso);

    // Recargar pesos en memoria
    await reloadWeights();

    res.json(updatedWeight);
  } catch (error) {
    console.error("Error al actualizar peso de criterio:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------- PERIODES ------------------------------ */

app.get("/periodes", async (req, res) => {
  try {
    const periodes = await getAllPeriodes();
    res.json(periodes);
  } catch (error) {
    console.error("Error al obtener periodes:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/periodes", async (req, res) => {
  try {
    const { dataIni, dataFi } = req.body;
    const periode = await createPeriodeDB(dataIni, dataFi);
    res.json(periode);
  } catch (error) {
    console.error("Error al crear periode:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------------- SYSTEM SETTINGS ------------------------------ */

app.get("/system-settings", async (req, res) => {
  try {
    const settings = await getSystemSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error al obtener configuración del sistema:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/system-settings/:id", async (req, res) => {
  try {
    const { selectedPeriodeId } = req.body;

    if (!selectedPeriodeId) {
      return res.status(400).json({ error: "selectedPeriodeId es requerido" });
    }

    const settings = await updateSystemSettings(selectedPeriodeId);
    res.json(settings);
  } catch (error) {
    console.error("Error al actualizar configuración del sistema:", error);
    res.status(500).json({ error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                                START SERVER                                */
/* -------------------------------------------------------------------------- */

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server is running on ::${port}`);
});
