//|| ============================================================================================ ||//
//|| La idea de l'aplicació és que per cada model hi hagin un endpoint que segueixi el model CRUD ||//
//|| passant informació pel body, i finalment trucant a les funcions a dins de CRUD/[acció].js    ||//
//|| ============================================================================================ ||//

import express from "express";

const app = express();

//CRUD Tallers
app.post("/tallers", (req, res) => {
  try {
    //lògica
  } catch (error) {
    console.log(error);
  }
});

app.get("/tallers", (req, res) => {});

app.put("/tallers", (req, res) => {});

app.delete("/tallers", (req, res) => {});

app.listen(3000, () => {
  console.log("El servidor està actiu a http://localhost:3000");
});
