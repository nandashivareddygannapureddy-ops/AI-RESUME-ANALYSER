# AI Resume Analyser 🚀

An intelligent full-stack AI Resume Analyzer and ATS scoring system designed to help job seekers optimize their resumes, match job descriptions, and maximize interview shortlists.

---

## 🌟 Features

- 📄 **Resume Parsing & Analysis**: Extract text, structure, and qualifications from uploaded resumes (PDF).
- 🎯 **ATS Scoring & Feedback**: Detailed ATS compatibility score with actionable recommendations.
- 🔍 **Job Description Matching**: Compare resumes against specific job descriptions for keyword and skill alignment.
- 🔐 **Authentication**: User authentication supporting standard JWT authentication and Google OAuth 2.0.
- 📊 **Interactive Dashboard**: Clean and modern UI for viewing analysis metrics, suggestions, and history.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18, Vite
- **Styling**: Modern CSS / TailwindCSS / Lucide Icons
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **File Handling**: Multer, PDF Parse
- **Auth**: JWT, Google Auth Library

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables in .env
npm run dev # or node server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL in .env (defaults to http://localhost:5000/api)
npm run dev
```

---

## 📂 Project Structure

```
AI-RESUME-ANALYSER/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── uploads/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── ...
    ├── index.html
    └── package.json
```

---

## 📄 License
ISC / MIT
