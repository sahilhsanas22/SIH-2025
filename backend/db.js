import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function getCertificateStatus({ name, marks, certificateId }) {
  await client.connect();
  const db = client.db("ocr_validation");
  const col = db.collection("certificates");
  // Find exact match
  const cert = await col.findOne({ name, marks, certificateId });
  if (cert) return "valid";
  // Find partial match
  const partial = await col.findOne({ certificateId });
  if (partial) return "suspicious";
  return "invalid";
}

export async function validateAuthenticatorLogin({ username, password }) {
  await client.connect();
  const db = client.db("ocr_validation");
  const col = db.collection("authenticators");
  const user = await col.findOne({ username, password });
  return !!user;
}

export async function validateAdminLogin({ username, password }) {
  await client.connect();
  const db = client.db("ocr_validation");
  const col = db.collection("admins");
  const user = await col.findOne({ username, password });
  return !!user;
}
