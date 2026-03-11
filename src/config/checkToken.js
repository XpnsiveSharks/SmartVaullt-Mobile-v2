const jwt = require("jsonwebtoken");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzaGFya3MiLCJleHAiOjE3NTgyMzMyMzh9.l9gKuSYCfkhDoqGiD2rj9e8fy5iw51vJ7vIzUTXcaZc";
const secret = "a699f178b8b83de7721314c70f2fdcd78f58a1a793a7c7ed1ce32c5e2dea348f";

try {
  const decoded = jwt.verify(token, secret);

  // convert exp (unix timestamp) → readable date
  const expDate = new Date(decoded.exp * 1000);

  console.log("✅ Valid token:");
  console.log("Payload:", decoded);
  console.log("Expires at:", expDate.toString());
} catch (err) {
  console.error("❌ Invalid token:", err.message);
}
