const express = require("express");
const app = express();
const crypto = require("crypto");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

const allowedHashes = [
  "9e9e7a3549c867473f573b4d6bafe2" // sample hashed UUID
];

const ipToUUID = {};     // IP → UUID
const uuidToIP = {};     // UUID → IP

app.post("/validate", (req, res) => {
  const uuid = req.body.uuid?.trim();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Validate UUID format
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
  const hash = crypto.createHash("sha256").update(uuid + "super-secret").digest("hex");

  if (!isValidUUID || !allowedHashes.includes(hash)) {
    return res.status(403).json({ status: "fail", reason: "UUID Invalid or Not Allowed" });
  }

  // If this UUID was already locked to a different IP
  if (uuidToIP[uuid] && uuidToIP[uuid] !== ip) {
    return res.status(403).json({ status: "fail", reason: "UUID already used by another IP" });
  }

  // If this IP already tried a different UUID
  if (ipToUUID[ip] && ipToUUID[ip] !== uuid) {
    return res.status(403).json({ status: "fail", reason: "IP already linked to a different UUID" });
  }

  // Lock the UUID to this IP
  uuidToIP[uuid] = ip;
  ipToUUID[ip] = uuid;

  return res.json({ status: "ok", message: "✅ UUID validated and locked to IP" });
});

app.listen(3000, () => {
  console.log("🔐 UUID IP Lock Server running on http://localhost:3000");
});
