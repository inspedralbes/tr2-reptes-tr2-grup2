import mysql from "mysql2";

export const createConn = () => {
  let result = mysql.createConnection({
    host: "localhost",
    user: "polApruebame",
    password: "vs-/ZR)NDyrsaBWo",
    database: "room_booking",
    port: 3306,
  });
  return result;
};
