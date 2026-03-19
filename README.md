# 🎵 Tunecraft — Personal Music Streaming App

A full-stack personal music streaming app powered by:
- **Frontend**: React (Spotify-like dark UI)
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Storage**: Telegram Bot API

---

## 📁 Folder Structure

```
music-app/
├── backend/
│   ├── server.js          ← Express API server
│   ├── package.json
│   ├── .env               ← Your secrets (create this!)
│   └── .env.example       ← Template
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js          ← Main React component
    │   ├── App.css         ← All styles
    │   └── index.js
    └── package.json
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- A Telegram Bot Token
- A Telegram Channel

---

## 🤖 Step 1: Telegram Setup

### Create a Bot
1. Open Telegram → search `@BotFather`
2. Send `/newbot` → follow prompts → copy the **Bot Token**

### Create a Channel
1. Create a new Telegram Channel (can be private)
2. Add your bot as **Administrator** (with "Post Messages" permission)
3. Get your Channel ID:
   - For public: use `@your_channel_name`
   - For private: forward a message to `@userinfobot` or use `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Private channel IDs look like: `-1001234567890`

---

## 🍃 Step 2: MongoDB Setup

### Option A — Local MongoDB
```bash
# Install MongoDB Community Edition
# https://www.mongodb.com/docs/manual/installation/
mongod --dbpath /your/data/path
# URI: mongodb://localhost:27017/musicapp
```

### Option B — MongoDB Atlas (Free Cloud)
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/musicapp`

---

## 🚀 Step 3: Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
```

Edit `.env`:
```env
TELEGRAM_BOT_TOKEN=7123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=@mychannel   # or -1001234567890
MONGODB_URI=mongodb://localhost:27017/musicapp
PORT=5000
FRONTEND_URL=http://localhost:3000
```

```bash
# 3. Start server
npm run dev      # with auto-reload (nodemon)
# or
npm start        # production
```

Backend will run at: `http://localhost:5000`

---

## 🎨 Step 4: Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. (Optional) Create .env for custom API URL
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# 3. Start development server
npm start
```

Frontend will run at: `http://localhost:3000`

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/upload` | Upload MP3 (multipart/form-data) |
| GET | `/songs` | Fetch all songs |
| GET | `/songs?playlist=name` | Filter by playlist |
| GET | `/playlists` | Get all playlist names |
| GET | `/music/:fileId` | Stream audio from Telegram |
| DELETE | `/song/:id` | Delete song from DB |
| PUT | `/song/:id` | Update song metadata |

### Upload Request Example
```bash
curl -X POST http://localhost:5000/upload \
  -F "file=@/path/to/song.mp3" \
  -F "title=My Song" \
  -F "artist=Artist Name" \
  -F "playlist=Favorites"
```

---

## 🎯 Features

- 🎵 Upload MP3s → stored in Telegram → streamed back in full quality
- 🎨 Spotify-inspired dark UI with Syne + DM Sans fonts
- 📂 Playlist organization & filtering
- 🔀 Shuffle mode
- ⏭️ Auto-play next song
- 🔊 Volume control + seekable progress bar
- 🗑️ Delete songs
- 📱 Fully responsive (desktop + mobile)
- 🔔 Toast notifications
- ⏳ Loading indicators & error handling

---

## ☁️ Free Deployment Options

### Frontend → Vercel (recommended)
```bash
cd frontend
npm run build
# Deploy /build folder to https://vercel.com
```
Set env var: `REACT_APP_API_URL=https://your-backend.railway.app`

### Backend → Railway
1. Push code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Free tier: 500 hours/month

### Database → MongoDB Atlas
- Free M0 tier: 512MB storage
- https://cloud.mongodb.com

### Alternative Backend hosts:
- **Render** (free tier): https://render.com
- **Fly.io** (free tier): https://fly.io

---

## 🛠️ Troubleshooting

### "Telegram upload failed"
- Verify bot token is correct
- Ensure bot is admin in the channel
- Check channel ID format (private = `-100xxxxxxxxxx`)

### "MongoDB connection error"
- Make sure MongoDB is running locally
- Or check Atlas connection string + IP whitelist

### "CORS error"
- Set `FRONTEND_URL=http://localhost:3000` in backend `.env`
- Ensure proxy is set in `frontend/package.json`

### Audio won't play
- Telegram file URLs expire after ~1 hour; the app fetches fresh ones per play
- Large files (>20MB) may take a moment to start streaming

---

## 📝 MongoDB Song Schema

```js
{
  title: String,       // Song title
  artist: String,      // Artist name (default: 'Unknown Artist')
  fileId: String,      // Telegram file_id (unique)
  playlist: String,    // Playlist name (default: 'All Songs')
  fileSize: Number,    // File size in bytes
  createdAt: Date      // Upload timestamp
}
```
