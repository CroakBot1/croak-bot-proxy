const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(bodyParser.json());

const allowedHashes = [
  "9e9e7a3549c867473f573b4d6bafe2"
];

const ipToUUID = {};
const uuidToIP = {};
let lastPingedIP = null;

app.post("/validate", (req, res) => {
  const uuid = req.body.uuid?.trim();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
  const hash = crypto.createHash("sha256").update(uuid + "super-secret").digest("hex");

  if (!isValidUUID || !allowedHashes.includes(hash)) {
    return res.status(403).json({ status: "fail", reason: "UUID Invalid or Not Allowed" });
  }

  if (uuidToIP[uuid] && uuidToIP[uuid] !== ip) {
    return res.status(403).json({ status: "fail", reason: "UUID already used by another IP" });
  }

  if (ipToUUID[ip] && ipToUUID[ip] !== uuid) {
    return res.status(403).json({ status: "fail", reason: "IP already linked to a different UUID" });
  }

  uuidToIP[uuid] = ip;
  ipToUUID[ip] = uuid;
  lastPingedIP = ip;

  return res.json({ status: "ok", message: "✅ UUID validated and locked to IP" });
});

// ✅ PORT fix for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
