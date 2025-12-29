/* ----------------------------------------- IMPORTS ----------------------------------------- */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
/* ----------------------------------------- CONFIG ----------------------------------------- */
dotenv.config();
const app = express();
const port = process.env.PORT;

console.log("Hola pokiwokie");

/* ----------------------------------------- SERVER APP ----------------------------------------- */
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

/* ----------------------------------------- ROUTES ----------------------------------------- */

/* ----------------------------------------- EXAMPLE -------------------------------------- */

// Definir una ruta d'exemple
app.get("/", (req, res) => {
  res.send("Hello World! XDDDDDDDDDDDDDDD");
});

/* ----------------------------------------- AUTH ----------------------------------------- */

/* ----------------------------------------- Assistencia ----------------------------------------- */

import { getAllAssistencies } from "./functions/database/CRUD/Assistencia.js";

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

/* ----------------------------------------- START SERVER ----------------------------------------- */

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server is running on ::${port}`);
});
