# 🎨 AI Image Prompt Generator  

This project allows you to **generate images using Gemini models** with **text + image prompts**, store results in **Cloudinary**, and display them in a **React frontend**.  

## ✨ Features
- 🔹 Enter a text prompt with optional aspect ratio (1:1, 16:9, 3:2, 4:5, 2:3).  
- 🔹 Upload one or more images (base64 encoded).  
- 🔹 Send text + images to **Google Gemini API** (`generateContent`).  
- 🔹 Store generated images securely in **Cloudinary**.  
- 🔹 Display results in UI with a history of prompts.  

---

## 🛠️ Tech Stack
- **Frontend:** React + Next.js  
- **Backend:** Next.js API routes (Node.js)  
- **AI Model:** Google Gemini API (`gemini-2.5-flash-image-preview`)  
- **Storage:** Cloudinary  
- **Types:** TypeScript  

---

## ⚡ Setup

### 1. Clone the repo
```bash
git clone https://github.com/TrilochanSahoo/AI-Thumbnail-Generator
cd AI-Thumbnail-Generator

npm install

Create .env.local file

GOOGLE_API_KEY=your_google_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

npm run dev

```

📖 Usage

Enter your text prompt (e.g. "A cyberpunk cityscape at night").

(Optional) Upload one or more images to guide the generation.

Select aspect ratio.

Click Generate.

The AI output will be uploaded to Cloudinary and displayed in your messages.

