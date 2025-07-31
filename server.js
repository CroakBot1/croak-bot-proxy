const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const allowedHashes = [
  "9e9e7a3549c867473f573b4d6bafe2" // example only
];

const uuidToIP = {};

app.get("/", (req, res) => {
  res.send("✅ UUID Validator Server is alive");
});

app.post("/validate", (req, res) => {
  const uuid = req.body.uuid?.trim();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!uuid) return res.status(400).json({ status: "fail", reason: "UUID missing" });

  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
  const hash = crypto.createHash("sha256").update(uuid + "super-secret").digest("hex");

  if (!isValidUUID || !allowedHashes.includes(hash)) {
    return res.status(403).json({ status: "fail", reason: "UUID Invalid or Not Allowed" });
  }

  if (!uuidToIP[uuid]) {
    uuidToIP[uuid] = ip;
    return res.json({ status: "ok", message: "✅ UUID validated and IP locked" });
  }

  if (uuidToIP[uuid] !== ip) {
    return res.status(403).json({ status: "fail", reason: "UUID already used by another IP" });
  }

  return res.json({ status: "ok", message: "✅ UUID already validated by your IP" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 UUID Lock Server running on port ${PORT}`);
});
