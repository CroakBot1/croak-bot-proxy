const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Plain allowed UUIDs
const allowedUUIDs = [
  "fb7c394b-4043-4870-882e-6dd2adbd7aa1",
  "ff5a0a29-64fc-4ff5-b87d-b8f2d5589d46",
  "355b2959-35b7-4086-a165-8a5077e73932",
  "b0f9f36f-0d28-4f7e-89ec-8a63db8b88e0",
  "f7cd0ff0-7c03-4ea3-98d4-92733f3e7c2e",
  "58c6d038-7402-466b-b275-928ad92ff594",
  "a2682340-3f1e-44f2-9442-f0c80dd3f22c",
  "9d27d9c8-7c66-4e5a-ae02-bc48e2d3fa95",
  "97e2f43e-ccbd-4af4-91cb-f77c9d682bf9",
  "c808e9cd-b54a-41be-b94a-1f4e808da9d3",
  "7eb9bc10-39fc-4ed9-b79a-94364bca6463",
  "531107cf-e046-4f4a-a6c1-73e8f27e1c27",
  "cced5507-5299-4a36-86cc-2a28285e9f4e",
  "5e7ab0f4-1729-4915-8c93-116d241e1137",
  "c07163f1-2ff1-4aa3-8c2c-f9e8c3be9160",
  "07123a84-3db0-4fa8-8c7f-d5fd6c2ef8e7",
  "62e0c4e8-064c-4555-842e-1e960d50f4ae",
  "c65c726b-8461-4b34-b53a-fd4325ed5304",
  "1a383a92-bdb1-4324-9429-cb8e79b12656",
  "4b58c6cd-826b-40f5-8a3b-9e24658ee3e0",
  "f9f9e5a4-099b-4e76-a6ef-09cf2997cc06",
  "de53ac56-52c6-4171-93e4-5fa2db655489",
  "87f9d2fc-7090-4c91-b92d-83936246bb49",
  "73cd979d-f3d7-4a89-bb69-e1d3729dfc14",
  "90f73bd6-48c0-470f-b2b3-8ae6a91da5f4",
  "3b630e69-b5a1-4b36-bc82-99c44e01be60",
  "bf757f15-9978-4d24-8d02-bc265d4e63c3",
  "1c78a90c-55fc-42b5-91c5-238a0ad40f0c",
  "eb5ac5a4-20e9-4d7b-bc6a-4457a3e8e625",
  "147fc13b-8ff7-48c4-bb4b-6d17338ce130"
];

// Store active sessions { uuid: { ip, lastSeen } }
const activeSessions = {};
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 mins

app.get("/", (req, res) => {
  res.send("✅ UUID Validator Server is alive");
});

app.post("/validate", (req, res) => {
  const uuid = req.body.uuid?.trim();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!uuid) return res.status(400).json({ status: "fail", reason: "UUID missing" });

  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
  if (!isValidUUID || !allowedUUIDs.includes(uuid)) {
    return res.status(403).json({ status: "fail", reason: "UUID Invalid or Not Allowed" });
  }

  const now = Date.now();
  const session = activeSessions[uuid];

  if (!session || now - session.lastSeen > SESSION_TIMEOUT_MS) {
    // No active session or expired — create new session
    activeSessions[uuid] = { ip, lastSeen: now };
    return res.json({ status: "ok", message: "✅ UUID validated, session started" });
  }

  if (session.ip === ip) {
    // Same IP — update session
    activeSessions[uuid].lastSeen = now;
    return res.json({ status: "ok", message: "✅ Continuing session from your IP" });
  }

  // If IP is different and session still active — deny access
  return res.status(409).json({
    status: "fail",
    reason: "⛔ Session already active from another IP. Try again later.",
    activeIp: session.ip,
    lastSeen: new Date(session.lastSeen).toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 UUID Validator running on port ${PORT}`);
});
