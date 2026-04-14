# AI Task Manager

A full-stack AI-powered task management application.

## 🚀 Features
- User authentication (Signup/Login)
- Task creation, update, delete
- AI-powered task suggestions
- Responsive UI

## 🛠 Tech Stack
Frontend: Next.js, TypeScript  
Backend: NestJS, Prisma  
Database: PostgreSQL  
Deployment: Vercel (Frontend), Render (Backend)

## 🌐 Live URLs
Frontend: https://ai-task-manager-git-main-sandeepk.vercel.app
Backend: https://ai-task-manager-12e3.onrender.com

## ⚙️ Setup

### Backend
cd backend  
npm install  
npx prisma migrate dev  
npm run start:dev  

For **AI summaries** when using `NEXT_PUBLIC_API_URL=http://localhost:4000`, set **`OPENAI_API_KEY`** in `backend/.env` to a real key. Do not leave `OPENAI_API_KEY=""` in that file — an empty value is loaded into the process and disables AI even if Render has a key.

### Frontend
cd frontend  
npm install  
npm run dev  
