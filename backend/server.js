require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const TELEGRAM_FILE_API = `https://api.telegram.org/file/bot${BOT_TOKEN}`;

console.log("\n========================================");
console.log("🎵 Tunecraft Music App - Backend");
console.log("========================================");
console.log(
  `BOT_TOKEN : ${BOT_TOKEN ? BOT_TOKEN.substring(0, 10) + "...[hidden]" : "❌ MISSING"}`,
);
console.log(`CHANNEL_ID: ${CHANNEL_ID || "❌ MISSING"}`);
console.log(
  `MONGO_URI : ${process.env.MONGODB_URI ? "✅ Set" : "using localhost"}`,
);
console.log("========================================\n");

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/musicapp")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

const songSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, default: "Unknown Artist", trim: true },
  fileId: { type: String, required: true },
  playlist: { type: String, default: "All Songs", trim: true },
  fileSize: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const Song = mongoose.model("Song", songSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "temp_uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok =
      file.mimetype.includes("audio") ||
      file.mimetype === "application/octet-stream" ||
      file.originalname.toLowerCase().endsWith(".mp3");
    cb(null, ok);
  },
});

function deleteTempFile(p) {
  try {
    if (p && fs.existsSync(p)) fs.unlinkSync(p);
  } catch (e) {}
}

// Upload to Telegram - tries sendAudio then sendDocument, logs full response
async function uploadToTelegram(filePath, fileName, title) {
  // ── Try sendAudio ──────────────────────────────────────────────
  try {
    console.log("📡 Trying sendAudio...");
    const form = new FormData();
    form.append("chat_id", CHANNEL_ID);
    form.append("audio", fs.createReadStream(filePath), {
      filename: fileName,
      contentType: "audio/mpeg",
    });
    form.append("title", title);

    const res = await axios.post(`${TELEGRAM_API}/sendAudio`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000,
    });

    console.log(
      "✅ sendAudio response:",
      JSON.stringify(res.data).substring(0, 200),
    );

    if (res.data.ok && res.data.result.audio) {
      return {
        fileId: res.data.result.audio.file_id,
        fileSize: res.data.result.audio.file_size || 0,
      };
    }
    throw new Error("sendAudio succeeded but audio field missing");
  } catch (err) {
    const desc = err.response?.data?.description || err.message;
    console.warn("⚠️  sendAudio failed:", desc);
  }

  // ── Try sendDocument ───────────────────────────────────────────
  try {
    console.log("📡 Trying sendDocument...");
    const form2 = new FormData();
    form2.append("chat_id", CHANNEL_ID);
    form2.append("document", fs.createReadStream(filePath), {
      filename: fileName,
      contentType: "audio/mpeg",
    });

    const res2 = await axios.post(`${TELEGRAM_API}/sendDocument`, form2, {
      headers: form2.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000,
    });

    console.log(
      "✅ sendDocument response:",
      JSON.stringify(res2.data).substring(0, 200),
    );

    if (res2.data.ok && res2.data.result.document) {
      return {
        fileId: res2.data.result.document.file_id,
        fileSize: res2.data.result.document.file_size || 0,
      };
    }
    throw new Error("sendDocument succeeded but document field missing");
  } catch (err) {
    const desc = err.response?.data?.description || err.message;
    console.error("❌ sendDocument failed:", desc);
    console.error("Full error:", JSON.stringify(err.response?.data));
    throw new Error(desc);
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    bot: !!BOT_TOKEN,
    channel: CHANNEL_ID,
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/test-telegram", async (req, res) => {
  try {
    const r = await axios.get(`${TELEGRAM_API}/getMe`);
    res.json({ ok: true, bot: r.data.result });
  } catch (err) {
    res
      .status(500)
      .json({ ok: false, error: err.response?.data || err.message });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No MP3 file received" });
  }
  if (!BOT_TOKEN || !CHANNEL_ID) {
    deleteTempFile(req.file?.path);
    return res.status(500).json({ error: "Telegram not configured in .env" });
  }

  const { title, artist = "Unknown Artist", playlist = "All Songs" } = req.body;
  if (!title) {
    deleteTempFile(req.file.path);
    return res.status(400).json({ error: "Title is required" });
  }

  console.log(
    `\n📤 Uploading: "${title}" | size: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
  );

  try {
    const result = await uploadToTelegram(
      req.file.path,
      req.file.originalname,
      title,
    );

    const song = new Song({
      title,
      artist,
      playlist,
      fileId: result.fileId,
      fileSize: result.fileSize || req.file.size,
    });
    await song.save();
    deleteTempFile(req.file.path);

    console.log(`✅ Saved to DB. fileId: ${result.fileId}`);
    res.status(201).json({ message: "Uploaded successfully", song });
  } catch (err) {
    deleteTempFile(req.file?.path);
    console.error("❌ Final upload error:", err.message);
    res.status(500).json({
      error: err.message || "Upload failed",
      hint: "Check terminal for details. Common issues: bot not admin in channel, wrong channel ID.",
    });
  }
});

app.get("/songs", async (req, res) => {
  try {
    const filter = req.query.playlist ? { playlist: req.query.playlist } : {};
    const songs = await Song.find(filter).sort({ createdAt: -1 });
    res.json({ songs, total: songs.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

app.get("/playlists", async (req, res) => {
  try {
    const playlists = await Song.distinct("playlist");
    res.json({ playlists });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

app.get("/music/:fileId", async (req, res) => {
  try {
    const r = await axios.get(`${TELEGRAM_API}/getFile`, {
      params: { file_id: req.params.fileId },
      timeout: 15000,
    });
    const fileUrl = `${TELEGRAM_FILE_API}/${r.data.result.file_path}`;
    const headers = req.headers.range ? { Range: req.headers.range } : {};
    const stream = await axios.get(fileUrl, {
      headers,
      responseType: "stream",
      timeout: 30000,
    });

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");
    if (stream.headers["content-length"])
      res.setHeader("Content-Length", stream.headers["content-length"]);
    if (stream.headers["content-range"])
      res.setHeader("Content-Range", stream.headers["content-range"]);
    res.status(req.headers.range ? 206 : 200);
    stream.data.pipe(res);
  } catch (err) {
    console.error("❌ Stream error:", err.message);
    if (!res.headersSent) res.status(500).json({ error: "Stream failed" });
  }
});

app.delete("/song/:id", async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted", song });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Max 50MB." });
  }
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`🔍 Test:   http://localhost:${PORT}/test-telegram\n`);
});
