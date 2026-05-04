# ⚡ Z-AI PowerHub

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Z.ai SDK](https://img.shields.io/badge/Z.ai-SDK-green?style=for-the-badge)](https://www.npmjs.com/package/z-ai-web-dev-sdk)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> The ultimate AI platform — intelligent chat, stunning image generation, vision analysis, text-to-speech, and real-time web search. All in one beautiful interface. Built by [T3rmuxk1ng](https://youtube.com/@T3rmuxk1ng).

---

## ✨ Features

- 🤖 **AI Chat** — Context-aware LLM with markdown rendering, syntax-highlighted code, and conversation history
- 🎨 **Image Studio** — Generate AI images in 7 sizes, analyze with Vision AI, download, and browse gallery
- 🔍 **Web Search** — Real-time web search with AI-powered summarization
- 🗣️ **Text-to-Speech** — Hear AI responses read aloud with configurable voices
- 👁️ **Vision Analysis** — Analyze images with AI vision model
- 📊 **Dashboard** — Analytics and capability overview with live stats
- 💾 **Database Persistence** — All conversations, images, and searches saved to SQLite
- 🌙 **Dark/Light Mode** — Beautiful theme toggle
- 📝 **Markdown Chat** — Full markdown with code syntax highlighting
- 📦 **Export** — Download generated images as PNG files

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | App Router & API routes |
| **React 19** | UI library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** | UI component library |
| **Prisma ORM** | Database modeling (SQLite) |
| **Z.ai SDK** | AI chat, image gen, VLM, TTS, web search |
| **Framer Motion** | Smooth animations |
| **React Markdown** | Markdown rendering |
| **Recharts** | Data visualization |

---

## 📡 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chat` | POST | AI chat with LLM |
| `/api/generate-image` | POST | AI image generation |
| `/api/vlm` | POST | Vision Language Model analysis |
| `/api/tts` | POST | Text-to-Speech synthesis |
| `/api/search` | GET | Real-time web search |
| `/api/history` | GET | Database history & stats |

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/T3RMUXK1NG/z-ai-powerhub.git
cd z-ai-powerhub

# Install dependencies
bun install

# Create environment file
cp .env.example .env

# Setup database
bunx prisma generate
bunx prisma db push

# Start development server
bun run dev
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# Z.ai API Key (required)
ZAI_API_KEY=your_zai_api_key
```

---

## 📁 Project Structure

```
z-ai-powerhub/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main app with tabs
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── api/
│   │       ├── route.ts       # Root API
│   │       ├── chat/          # AI chat endpoint
│   │       ├── generate-image/ # Image generation
│   │       ├── vlm/           # Vision analysis
│   │       ├── tts/           # Text-to-speech
│   │       ├── search/        # Web search
│   │       └── history/       # DB history & stats
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── markdown-renderer.tsx
│   ├── hooks/
│   │   └── use-toast.ts
│   └── lib/
│       ├── db.ts              # Prisma client
│       └── utils.ts           # Utilities
├── prisma/
│   └── schema.prisma          # Database schema
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Schema

- **Conversation** — Chat sessions with title and timestamps
- **Message** — Individual chat messages (user/assistant)
- **GeneratedImage** — AI-generated images with base64 data
- **SearchQuery** — Web search history
- **TTSRequest** — Text-to-speech request logs
- **VisionAnalysis** — Vision AI analysis results

---

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |

---

## 📺 YouTube

> Learn how to build AI-powered web apps! Watch tutorials on **[T3rmuxk1ng YouTube Channel](https://youtube.com/@T3rmuxk1ng)**

---

## 👤 Author

**T3RMUXK1NG (T3rmuxk1ng)**

- YouTube: [https://youtube.com/@T3rmuxk1ng](https://youtube.com/@T3rmuxk1ng)
- GitHub: [T3RMUXK1NG](https://github.com/T3RMUXK1NG)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**If you found this project useful, give it a star!**

[YouTube](https://youtube.com/@T3rmuxk1ng) | [GitHub](https://github.com/T3RMUXK1NG)

</div>
