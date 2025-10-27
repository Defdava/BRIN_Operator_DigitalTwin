import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

dotenv.config();

const app = express();
const port = process.env.PORT || 9999;

// Untuk dapatkan __dirname di ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware dasar
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔧 Inisialisasi Firebase Admin SDK
try {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  console.log("✅ Firebase Admin initialized successfully!");
} catch (error) {
  console.error("⚠️ Firebase Admin initialization failed:", error.message);
}

// 🏠 Route utama (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔐 Contoh route login (opsional)
app.post("/login", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    res.json({ success: true, user: user.email });
  } catch (err) {
    res.status(401).json({ success: false, message: "Login gagal" });
  }
});

// 🚀 Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
