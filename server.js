const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const allowedHashes = [
  "0cb53791bcf40c80ae58aa7d0a5c41e61bc4064e3e9248e1ff777c51403809d1",
  "0e356d4308418a227173f376c44ff07f43a6255c53e5c209ed2320b6d4a7d28d",
  "17a97375e730e6f9f71b681998dd2a4893c03d812a41de4c558f2e38f23e6b42",
  "2ffdcde827ffcdaf9896a48f8de40947a16335ef14f78b405a02baf19c503cf6",
  "382a15172c88edfc9610b32bc80e29575a9a9e6f8ed29a9d5e6d3ce89cc1a81a",
  "3b80ebfd25798b5b1aa7254874b30f1a6f4dff06192f2ef27ce45009b7cf4b6b",
  "3c8ab13fd2bb5df0886a99be4d5f92fd6e70bc5dbe8037fa0b5206f7d91d2e71",
  "40d315c19e2c8f0bc96b21663b4ff3b469005066b9981c5c4efebf0a0ff30cf5",
  "4373a2d2183a95a30b6c689a4d071b0c090137d0c3853d901c8b8b9626c2304e",
  "47cf35d3f2b43bfc9bbcf4377c8e66abfd2f0d1a48fcd0802cb99d71fba59c52",
  "4a4dd317e58df934d0f859e03a90b4c3b579d191cdb13f9bcb8fd75c316d4093",
  "4db47b370a66e309cced4308088496d70d1590175b36290c99788f0136c98411",
  "5d28bc36cc0fd36d5b3b0a72a23a179eb2ef8b0ed87d3ef89bd8a9796e4ec947",
  "5f36a529258d72fe86ed12a5d76b238acdc7757f4037f772cbf7b38a9de10d7f",
  "69a7a30cd8b2f85a87e2ee8d7fd21717a93f4c404ed1d7e23a33d68284d0d04f",
  "6d2dfc98bc65bc23cfdc1b733b5c2969e3069f7c4cd470a589a74b7272df5c8b",
  "6ee93020e5483277f94f01484684ed86130b87a81de55e58ec4a360ee0ec2893",
  "6f796b4aeac95f2b603d5b1817e5704535b87989b2dfbd918d4e96205c4c9c14",
  "713c0df4a3dd967c1d172385fd8ef78f89f678b9fe68a7c57fd4602ac6f3c0cc",
  "76ed99e268aee4e6b76aa7e9c030404b29dd2f4cfd3500aeb2a87ff6e3c98c6b",
  "8f0180504c010f5ad535c2460b5bb0ef1ae81630f58ff8803f44fd72b640e82b",
  "9b9d98523ed041fdc54738d84dd888b24b83316db1b0b15bd76089b8e52951c6",
  "a1903b209e4537cbf82cf793f3c12c3f13d95e5efcb4a9d9a6072715fd5ea83b",
  "b89eb929fcf2bb93a76329f2ffb2313ff31bc0543de11a7f19836d9e8416c870",
  "c0a3555aeea2ec15e235da118aa3888d1a6c2ce6632060f29ad4d2a2fd1eb07f",
  "c70aa3a380fe81b9e1223e6e44a556a014de60b5393caa95c4fd393bdc258b7c",
  "d612fd2db59e33274b8c2223e2b5e01e60b8048fd8621d61f6e97a5e5c1ebef6",
  "d9f37cf571c9dc31d6c41ee37f382f17f713ed1b12303059dbb395a39829268c",
  "e192d8e169a8b4d961aeb479f2c399f749ef0cb61ae2e8aa9c52b289f3b6f8f9",
  "f366f57b251e9a679d2b4bc1a127808f016701ca104a2b90f7d8b602e7a5fcf3"
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
