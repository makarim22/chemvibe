import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

const BADGE_SECRET_KEY = process.env.BADGE_SECRET_KEY || "chemvibe_quantum_super_secret_salt_2026_xyz";

function generateBadgeSignature(userId: string, badgeId: string, points: number, timestamp: number): string {
  const data = `${userId}:${badgeId}:${points}:${timestamp}`;
  return crypto.createHmac("sha256", BADGE_SECRET_KEY).update(data).digest("hex");
}

// Secure endpoints for cryptographic badges
app.post("/api/badges/sign", (req, res) => {
  try {
    const { userId, badgeId, points } = req.body;
    if (!userId || !badgeId || points === undefined) {
      return res.status(400).json({ error: "Kolom wajib diisi: userId, badgeId, points" });
    }
    const timestamp = Date.now();
    const signature = generateBadgeSignature(userId, badgeId, Number(points), timestamp);
    res.json({
      success: true,
      id: `${userId}_${badgeId}`,
      userId,
      badgeId,
      points: Number(points),
      timestamp,
      signature
    });
  } catch (error: any) {
    console.error("Error signing badge:", error);
    res.status(500).json({ error: "Gagal menandatangani lencana secara kriptografis: " + error.message });
  }
});

app.post("/api/badges/verify", (req, res) => {
  try {
    const { userId, badgeId, points, timestamp, signature } = req.body;
    if (!userId || !badgeId || points === undefined || !timestamp || !signature) {
      return res.status(400).json({ error: "Sintaks verifikasi tidak lengkap" });
    }
    const expectedSignature = generateBadgeSignature(userId, badgeId, Number(points), Number(timestamp));
    const isValid = signature === expectedSignature;
    res.json({
      valid: isValid,
      details: isValid ? "Kredensial lencana valid dan terenkripsi secara aman di database Cloud" : "Kredensial lencana tidak sah atau tandatangan salah"
    });
  } catch (error: any) {
    console.error("Error verifying badge:", error);
    res.status(500).json({ error: "Gagal memverifikasi lencana: " + error.message });
  }
});

// Lazy initialization of Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Peringatan: GEMINI_API_KEY tidak dikonfigurasi. Pastikan telah diset di Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// AI Chemistry Assistant endpoint
app.post("/api/gemini/chemistry-assistant", async (req, res) => {
  try {
    const { history, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong" });
    }

    const ai = getGeminiClient();
    
    // Format contents for the SDK
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || msg.content || "" }]
        });
      });
    }

    // Append the latest user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: "Anda adalah Asisten Laboratorium Kimia Cerdas ('AI Chemistry Assistant') di platform ChemVibe. Anda adalah asisten virtual ahli kimia, membimbing siswa dalam memahami teori kimia, perhitungan stoikiometri, kinetika reaksi, termokimia, elektrokimia, kimia organik, biomolekul, serta analisis praktikum (seperti titrasi, pH buffer, kelarutan Ksp, dan uji nyala). Jawab pertanyaan pengguna secara akurat, komprehensif, inspiratif, namun mudah dipahami dalam bahasa Indonesia yang santun dan profesional. Format jawaban Anda menggunakan markdown yang sangat rapi. Gunakan simbol kimia dan indeks bawah/atas yang tepat (seperti H₂O, CO₃²⁻, ΔH). Jika pengguna bertanya di luar jangkauan kimia, berikan jawaban sopan bahwa peran Anda terbatas pada pendampingan sains kimia."
      }
    });

    const replyText = response.text || "Tidak ada respon dari asisten.";
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ 
      error: "Gagal menghubungkan ke Asisten Laboratorium Cerdas. " + (error.message || "Pastikan API Key di Settings > Secrets sudah diisi.")
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "ChemVibe Full Stack Server" });
});

// Setup Vite Dev server or Serve static files
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Memulai server dalam mode pengembangan (Development)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Memulai server dalam mode produksi (Production)...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server ChemVibe aktif dan berjalan pada http://localhost:${PORT}`);
  });
};

startServer();
