import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "your-secret-key";
const refreshKey = process.env.JWT_REFRESH_SECRET || "your-refresh-key";

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePassword(password, hashedPassword) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}

export function generateTokens(user) {
  const aToken = jwt.sign(
    { id: user.id, nom: user.nom, rol: user.rol },
    secretKey,
    { expiresIn: "1h" }
  );
  const rToken = jwt.sign(
    { id: user.id, nom: user.nom, rol: user.rol },
    refreshKey,
    { expiresIn: "7d" }
  );
  return { accessToken: aToken, refreshToken: rToken };
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshKey);
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Token es requerido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Formato de token inválido" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expirado" });
      }
      return res.status(403).json({ error: "Fallo al autenticar el token" });
    }
    req.user = decoded;
    next();
  });
}

export { secretKey, refreshKey };