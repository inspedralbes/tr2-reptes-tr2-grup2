/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {
  comparePassword,
  generateTokens,
  verifyRefreshToken,
  secretKey,
  hashPassword,
} from "./functions/auth.js";
import {
  getUsuariForAuth,
  updateUsuariToken,
} from "./functions/database/CRUD/Usuaris.js";
import { getInscripciosByTallerId } from "./functions/database/CRUD/Inscripcions.js";
import { calcularPuntuacionesDelTaller } from "./functions/database/Criteris.js";

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
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.use("/images", express.static("./files/images"));
app.use("/archives", express.static("./files/archives"));

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
    const prisma = await import("./generated/prisma/index.js").then(
      (m) => m.default || m,
    );

    const user = await prisma.usuaris.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Usuari no trobat" });
    }

    if (!user.autoritzat) {
      return res.status(403).json({ error: "Usuari no autoritzat" });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Contrasenya incorrecta" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Guardar el refresh token en la base de datos
    await prisma.usuaris.update({
      where: { email },
      data: { token: refreshToken },
    });

    res.status(200).json({
      message: "Login correcte",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        rol: user.rol,
        institucio: user.institucio,
      },
    });
  } catch (error) {
    console.error("Error de base de dades:", error);
    res.status(500).json({ error: "Error de base de dades: " + error.message });
  }
});

// Ruta de registre
app.post("/register", async (req, res) => {
  const { nom, email, password, rol, responsable } = req.body;

  // Validar camps obligatoris
  if (!nom || !email || !password) {
    return res
      .status(400)
      .json({ error: "Falten camps obligatoris (nom, email, password)" });
  }

  try {
    const prisma = await import("./generated/prisma/index.js").then(
      (m) => m.default || m,
    );

    // Verificar si l'usuari ja existeix
    const existingUser = await prisma.usuaris.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({ error: "L'email ja existeix" });
    }

    // Hashear la contrasenya
    const hashedPassword = await hashPassword(password);

    let newInstitucio = null;

    // Si s'envia dades de responsable, crear la institució
    if (responsable && responsable.nom && responsable.codi_centre) {
      newInstitucio = await prisma.institucions.create({
        data: {
          nom: responsable.nom,
          codi_centre: responsable.codi_centre,
          direccio: responsable.direccio || "",
          codi_postal: responsable.codi_postal || "",
        },
      });
    }

    // Crear el nou usuari
    const newUser = await prisma.usuaris.create({
      data: {
        nom,
        email,
        password: hashedPassword,
        telefon: 0,
        rol: rol || "Professorat",
        autoritzat: false, // Per defecte no autoritzat fins que un admin l'aprovi
        responsable: !!newInstitucio, // Si s'ha creat institució, és responsable
        institucio: newInstitucio ? newInstitucio.id : null,
      },
    });

    res.status(201).json({
      message: "Usuari i institució registrats correctament",
      user: {
        id: newUser.id,
        nom: newUser.nom,
        email: newUser.email,
        rol: newUser.rol,
        responsable: newUser.responsable,
      },
      institucio: newInstitucio
        ? { id: newInstitucio.id, nom: newInstitucio.nom }
        : null,
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

import uploadArchives from "./functions/uploads/archives.cjs";
import uploadImages from "./functions/uploads/images.cjs";

app.post("/uploadImage", uploadImages.single("file"), (req, res) => {
  res.json({ message: "Imagen subida", file: req.file });
});

app.post("/uploadArchive", uploadArchives.single("file"), (req, res) => {
  res.json({ message: "Archivo subido", file: req.file });
});

app.post("/uploadFiles", uploadArchives.array("files", 10), (req, res) => {
  res.json({ message: "Archivos subidos", files: req.files });
});

/* ------------------------------- ASSISTENCIA ------------------------------ */

import {
  getAllAssistencies,
  getAssistenciaById,
  createAssistencia,
  updateAssistencia,
  deleteAssistencia,
} from "./functions/database/CRUD/Assistencia.js";

app.get("/assistencies", async (req, res) => {
  const assistencies = await getAllAssistencies();
  res.json(assistencies);
});

app.get("/assistencies/:id", async (req, res) => {
  const { id } = req.params;
  const assistencia = await getAssistenciaById(id);
  res.json(assistencia);
});

app.post("/assistencies", async (req, res) => {
  const data = req.body;
  const newAssistencia = await createAssistencia(data);
  res.json(newAssistencia);
});

app.put("/assistencies", async (req, res) => {
  const data = req.body;
  const updatedAssistencia = await updateAssistencia(data);
  res.json(updatedAssistencia);
});
app.delete("/assistencies/:id", async (req, res) => {
  const { id } = req.params;
  const deletedAssistencia = await deleteAssistencia(id);
  res.json(deletedAssistencia);
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
} from "./functions/database/CRUD/Inscripcions.js";

app.get("/inscripcions", async (req, res) => {
  const inscripcions = await getAllInscripcions();
  res.json(inscripcions);
});

app.get("/inscripcions/:id", async (req, res) => {
  const { id } = req.params;
  const inscripcio = await getInscripcioById(id);
  res.json(inscripcio);
});

app.post("/inscripcions", async (req, res) => {
  const data = req.body;
  const newInscripcio = await createInscripcio(data);
  res.json(newInscripcio);
});

app.post("/inscripcions/dadesinsc", async (req, res) => {
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
  const data = req.body;
  const updatedInscripcio = await updateInscripcio(data);
  res.json(updatedInscripcio);
});

app.delete("/inscripcions/:id", async (req, res) => {
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
  const institucions = await getAllInstitucions();
  res.json(institucions);
});

app.get("/institucions/:id", async (req, res) => {
  const { id } = req.params;
  const institucio = await getInstitucioById(id);
  res.json(institucio);
});

app.post("/institucions", async (req, res) => {
  const data = req.body;
  const newInstitucio = await createInstitucio(data);
  res.json(newInstitucio);
});

app.put("/institucions", async (req, res) => {
  const data = req.body;
  const updatedInstitucio = await updateInstitucio(data);
  res.json(updatedInstitucio);
});

app.delete("/institucions/:id", async (req, res) => {
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
} from "./functions/database/CRUD/Tallers.js";

app.get("/tallers", async (req, res) => {
  const tallers = await getAllTallers();
  res.json(tallers);
});

app.get("/tallers/:id", async (req, res) => {
  const { id } = req.params;
  const taller = await getTallerById(id);
  res.json(taller);
});

app.post("/tallers", async (req, res) => {
  try {
    const data = req.body;

    // Validaciones básicas
    if (
      !data.nom ||
      !data.descripcio ||
      !data.tallerista ||
      !data.direccio ||
      !data.horari ||
      !data.periode ||
      !data.admin
    ) {
      return res.status(400).json({
        error:
          "Falten camps obligatoris (nom, descripcio, tallerista, direccio, horari, periode, admin)",
      });
    }

    const newTaller = await createTaller(data);
    res.status(201).json(newTaller);
  } catch (error) {
    console.error("Error al crear taller:", error);
    res.status(500).json({ error: error.message || "Error al crear taller" });
  }
});

app.get("/tallers/:id/inscripcions", async (req, res) => {
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

app.put("/tallers", async (req, res) => {
  const data = req.body;
  const updatedTaller = await updateTaller(data);
  res.json(updatedTaller);
});

app.delete("/tallers/:id", async (req, res) => {
  const { id } = req.params;
  const deletedTaller = await deleteTaller(id);
  res.json(deletedTaller);
});

/* ------------------------------- USUARIS ------------------------------ */

import {
import archiver from "archiver";
  getAllUsuaris,
  getUsuariById,
  createUsuari,
  updateUsuari,
  deleteUsuari,
} from "./functions/database/CRUD/Usuaris.js";

app.get("/usuaris", async (req, res) => {
  const usuaris = await getAllUsuaris();
  res.json(usuaris);
});

app.get("/usuaris/:id", async (req, res) => {
  const { id } = req.params;
  const usuari = await getUsuariById(id);
  res.json(usuari);
});

app.post("/usuaris", async (req, res) => {
  const data = req.body;
  const newUsuari = await createUsuari(data);
  res.json(newUsuari);
});

app.put("/usuaris", async (req, res) => {
  const data = req.body;
  const updatedUsuari = await updateUsuari(data);
  res.json(updatedUsuari);
});

app.delete("/usuaris/:id", async (req, res) => {
  const { id } = req.params;
  const deletedUsuari = await deleteUsuari(id);
  res.json(deletedUsuari);
});

/* -------------------------------------------------------------------------- */
/*                                START SERVER                                */
/* -------------------------------------------------------------------------- */

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server is running on ::${port}`);
});
