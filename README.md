# InterviewPrep AI

AI-powered interview preparation and mock interview platform built with React, Node.js, Express, MongoDB and Google Gemini.

## 🚀 Features

- 🔐 JWT authentication
- 🤖 AI-generated interview questions
- 🎯 AI-powered answer evaluation
- 🧠 Adaptive interview difficulty
- 💼 Technical, HR, Behavioral and Mixed modes
- 📊 Performance analytics
- 📈 Score and skill tracking
- 📚 Personal question bank
- 📌 Pin, edit and delete questions
- 🗓️ Personalized 4-week AI preparation plan
- 🔥 Practice streak tracking
- 📝 Interview history and results
- ⚡ RESTful API architecture
- 🛡️ Input validation and rate limiting
- 📖 Swagger API documentation
- 🧪 Automated backend tests

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Express Validator
- Morgan
- Express Rate Limit
- Swagger UI

### AI

- Google Gemini API

### Deployment

- Vercel
- Render

## 🏗️ Architecture

```text
React + Vite
     │
     │ Axios / REST API
     ▼
Node.js + Express
     │
     ├── Authentication
     ├── Interview Engine
     ├── AI Services
     ├── Evaluation
     ├── Analytics
     └── Preparation Plans
     │
     ├───────────────┐
     ▼               ▼
MongoDB          Google Gemini
