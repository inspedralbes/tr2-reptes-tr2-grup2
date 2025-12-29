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

// Route for refresh access token
app.post("/refresh", async (req, res) => {
  console.log("Refresh token 0:", req.body);
  const { refreshToken } = req.body;

  console.log("Refresh token 1:", refreshToken);

  if (!refreshToken) return res.status(401).send("Token is required");
  if (!refreshTokensDB.has(refreshToken))
    return res.status(403).send("Invalid token");

  try {
    console.log("Refresh token 2:", refreshToken);
    const decoded = jwt.verify(refreshToken, refreshKey);
    console.log("Decoded:", decoded);
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      secretKey,
      { expiresIn: "1h" }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.log("Error refresh:", err);
    refreshTokensDB.delete(refreshToken);
    res.status(403).json({ error: "Invalid token or expired" });
  }
});

// Function to verify token
// Use in EX; app.post('/users/qualifications', verifyToken, async (req, res) => {...
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Token es requerido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Formato de token inválido" });
  }

  console.log("Token:", token);

  jwt.verify(token, secretKey, (err, decoded) => {
    console.log("Decoded:", decoded);
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
