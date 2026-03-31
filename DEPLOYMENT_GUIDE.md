# 🚀 Deployment Guide - Tunecraft Music App

## Prerequisites

- GitHub account
- Railway account (or Render/Heroku)
- MongoDB Atlas connection string ✅ (already configured)
- Telegram bot token ✅ (already configured)

---

## 📋 Current Configuration

✅ **MongoDB Atlas**: Connected to `cluster0.gccwfqu.mongodb.net`
✅ **Telegram Bot Token**: Configured
✅ **Telegram Channel ID**: Configured

---

## 🌐 Deployment Options

### **Option 1: Railway (Recommended) + Vercel**

#### Step 1: Deploy Backend on Railway

1. **Push code to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Setup Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up
   - Create new project → Deploy from GitHub
   - Select your repository

3. **Configure Environment Variables in Railway**
   - Go to Variables tab
   - Copy these from your `.env` file:
     ```
     TELEGRAM_BOT_TOKEN=8696070932:AAF5Swv6Wls2Sssxwn4mBsrxalPVcMRncDc
     TELEGRAM_CHANNEL_ID=-1003833063590
     MONGODB_URI=mongodb+srv://praveen:praveen882005@cluster0.gccwfqu.mongodb.net/?appName=Cluster0
     PORT=5000
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

4. **Deploy**
   - Railway auto-detects Node.js
   - Takes ~2-3 minutes
   - Get your backend URL (e.g., `https://your-app.railway.app`)

#### Step 2: Deploy Frontend on Vercel

1. **Update Frontend API Proxy**
   - Edit `frontend/package.json`
   - Replace proxy with your backend URL:
     ```json
     "proxy": "https://your-backend-url.railway.app"
     ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Import repository
   - Vercel auto-detects React app
   - Deploy ✅

3. **Set Environment Variables (if needed)**
   - In Vercel project → Settings → Environment Variables
   - Add the backend URL if required

---

### **Option 2: Render + Vercel**

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Select your GitHub repo
4. Set Build command: `npm run build --prefix backend`
5. Set Start command: `npm start --prefix backend`
6. Add environment variables
7. Deploy

---

### **Option 3: Docker Deployment (Advanced)**

Create `Dockerfile` in backend/

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## ✅ Checklist Before Deployment

- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] MongoDB Atlas connection tested
- [ ] Telegram bot token valid
- [ ] `FRONTEND_URL` updated to production URL
- [ ] Cross-origin (CORS) settings updated if needed

---

## 🔒 Security Notes

⚠️ **WARNING: DO NOT commit `.env` to GitHub!**

Already ignored files:

- `.env` ✅ (should be in .gitignore)

---

## 📞 Troubleshooting

### "MongoDB connection failed"

- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas (allow all: 0.0.0.0/0)

### "CORS error"

- Update `FRONTEND_URL` in backend
- Check `cors({ origin: "*" })` in server.js

### "Telegram bot not working"

- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check `TELEGRAM_CHANNEL_ID` format

---

## 📊 Expected Costs (Free Tier)

| Service       | Free Tier             | Cost                      |
| ------------- | --------------------- | ------------------------- |
| MongoDB Atlas | 512MB storage         | Free                      |
| Railway       | $5/month              | ~$0 (free tier available) |
| Vercel        | Unlimited deployments | Free                      |
| **Total**     | -                     | **Free - $5/month**       |

---

## 🎯 Next Steps

1. Push code to GitHub
2. Deploy backend on Railway
3. Get backend URL
4. Update frontend proxy
5. Deploy frontend on Vercel
6. Test the live app

**Questions?** Check the server logs and error messages!
