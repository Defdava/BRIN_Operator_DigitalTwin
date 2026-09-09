import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

dotenv.config();

const app = express();
const port = process.env.PORT || 1219;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔧 Firebase Initialization
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

// 🏠 Rute Eksplisit untuk File HTML Utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/forgotpassword.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "forgotpassword.html"));
});

app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Jalankan server (untuk local)
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`🚀 Running at http://localhost:${port}`));
}

export default app;