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
  })
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
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

// Login route
app.post("/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await getUsuariForAuth(parseInt(id));

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
    await updateUsuariToken(parseInt(id), refreshToken);

    res.status(200).json({
      message: "Login correcte",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nom: user.nom,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("Error de base de dades:", error);
    res.status(500).json({ error: "Error de base de dades" });
  }
});

// Register route
app.post("/register", async (req, res) => {
  const { id, nom, password, rol, institucioId } = req.body;

  // Validar campos requeridos
  if (!id || !nom || !password) {
    return res
      .status(400)
      .json({ error: "Falten camps obligatoris (id, nom, password)" });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await getUsuariForAuth(parseInt(id));
    if (existingUser) {
      return res.status(409).json({ error: "L'usuari ja existeix" });
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el nuevo usuario
    const newUser = await createUsuari({
      id: parseInt(id),
      nom,
      password: hashedPassword,
      rol: rol || "Professorat",
      autoritzat: false, // Por defecto no autorizado hasta que un admin lo apruebe
      institucioId: institucioId ? parseInt(institucioId) : null,
    });

    res.status(201).json({
      message: "Usuari registrat correctament",
      user: {
        id: newUser.id,
        nom: newUser.nom,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuari:", error);
    res.status(500).json({ error: "Error al registrar l'usuari" });
  }
});

// Refresh token route
app.post("/refresh", async (req, res) => {
  const { refreshToken, userId } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Token requerit" });
  }

  try {
    // Verifica que el token almacenado en BD coincida
    const user = await getUsuariForAuth(parseInt(userId));

    if (!user || user.token !== refreshToken) {
      return res.status(403).json({ error: "Token invàlid" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = jwt.sign(
      { id: decoded.id, nom: decoded.nom, rol: decoded.rol },
      secretKey,
      { expiresIn: "1h" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Error en refresh:", err);
    res.status(403).json({ error: "Token invàlid o expirat" });
  }
});

// Logout route
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
  const data = req.body;
  const newTaller = await createTaller(data);
  res.json(newTaller);
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
