# BexCode - Health Consultation Intake System

A full-stack application for collecting health consultation data with a React frontend and Node.js backend. Built with TypeScript, MongoDB, and modern web technologies.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- Git
- Vercel CLI (for deployment)

### Local Development

1. **Clone and Install**
```bash
git clone https://github.com/yourusername/bexcode-health-consultation.git
cd bexcode-health-consultation

# Install all dependencies
npm install
```

2. **Configure Environment**
Create `.env.local` in the root directory (copy from `.env.example`):
```bash
# Backend
MONGODB_URI=mongodb://localhost:27017/consultations
PORT=5000
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:5000/api
```

3. **Run Development Servers**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Visit: http://localhost:5173

## 📦 Project Structure

```
bexcode-health-consultation/
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── utils/              # Helper functions
│   │   ├── types/              # TypeScript interfaces
│   │   └── data/               # Static data (questionnaire.json)
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Express + TypeScript
│   ├── src/
│   │   ├── index.ts            # Express server
│   │   ├── config/             # Configuration
│   │   ├── models/             # MongoDB schemas
│   │   ├── controllers/        # Business logic
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Express middleware
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Utilities
│   └── package.json
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── vercel.json                  # Vercel configuration
└── README.md
```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Consultations
- `POST /api/consultations` - Submit a new consultation
- `GET /api/consultations` - Get all consultations (admin)
- `GET /api/consultations/:id` - Get specific consultation
- `GET /api/consultations/stats` - Get submission statistics

## 🚀 Deployment on Vercel

### Why Vercel?
- **Best for this stack**: Excellent support for Node.js, React, and TypeScript
- **Monorepo support**: Easy to manage frontend and backend in one repo
- **Environment variables**: Secure, easy-to-manage secret management
- **Automatic deployments**: Deploy on every git push
- **Serverless functions**: Backend can run as serverless functions
- **MongoDB Atlas integration**: One-click integration with MongoDB

### Deployment Steps

#### 1. Push to GitHub
```bash
git remote add origin https://github.com/yourusername/bexcode-health-consultation.git
git branch -M main
git push -u origin main
```

#### 2. Deploy Frontend + Backend to Vercel

**Option A: Two Separate Projects (Recommended)**

**Frontend Deploy:**
1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Set Root Directory: `frontend`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://bexcode-api.vercel.app/api`
5. Deploy

**Backend Deploy:**
1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Set Root Directory: `backend`
4. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `CORS_ORIGIN`: Your frontend URL (e.g., https://bexcode.vercel.app)
   - `NODE_ENV`: `production`
5. Add a `vercel.json` in the backend folder:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```
6. Deploy

**Option B: Monorepo with rewrites (Single Vercel Project)**
Use the provided `vercel.json` configuration.

### 3. Configure Environment Variables

**Frontend (.env):**
```
VITE_API_URL=https://bexcode-api.vercel.app/api
```

**Backend (.env):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/consultations
PORT=3000
CORS_ORIGIN=https://bexcode.vercel.app
NODE_ENV=production
```

### 4. GitHub Secrets Setup (Optional - for CI/CD)

If implementing GitHub Actions, add these secrets:
- `VERCEL_TOKEN`: Get from https://vercel.com/account/tokens
- `VERCEL_ORG_ID`: From Vercel project settings
- `VERCEL_PROJECT_ID_FRONTEND`: Frontend project ID
- `VERCEL_PROJECT_ID_BACKEND`: Backend project ID

## 🗄️ MongoDB Setup

### Using MongoDB Atlas (Cloud):
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user
3. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/consultations`
4. Add to Vercel environment variables

### Using Local MongoDB:
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use: `mongodb://localhost:27017/consultations`

## 🔒 Environment Variables Management

### Local Development
- Create `.env.local` file (git-ignored)
- Load variables from `.env.local` in development

### Production (Vercel)
- Set environment variables in Vercel dashboard
- No secrets in git repository
- Use Environment Variable Groups for easier management

### Environment Variable Reference
See `.env.example` for all available variables.

## 🧪 Testing the Deployment

After deploying, test endpoints:

```bash
# Health check
curl https://bexcode-api.vercel.app/api/health

# Test submission
curl -X POST https://bexcode-api.vercel.app/api/consultations \
  -H "Content-Type: application/json" \
  -d '{
    "userDetails": {
      "fullName": "Test User",
      "email": "test@example.com",
      "phone": "5551234567",
      "dateOfBirth": "1990-01-15"
    },
    "responses": [
      {
        "questionId": "q1",
        "questionType": "radio",
        "answer": "Yes"
      }
    ],
    "metadata": {
      "timezone": "America/New_York",
      "submittedAt": "2026-03-18T16:30:00.000Z"
    }
  }'
```

## 🛠️ Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` environment variable matches your frontend URL
- Check backend logs in Vercel dashboard

### API Connection Issues
- Verify `VITE_API_URL` is correct in frontend
- Check MongoDB connection string
- Review Vercel function logs

### Build Failures
- Check `vercel.json` configuration
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

## 📝 Features

✅ **Dynamic Form Rendering** - Questions load from JSON  
✅ **Conditional Logic** - Questions appear/hide based on responses  
✅ **Type Safety** - Full TypeScript with zero `any` types  
✅ **Form Validation** - Client-side and server-side  
✅ **Timezone Capture** - Automatic user timezone detection  
✅ **Responsive Design** - Works on mobile and desktop  
✅ **Error Handling** - Comprehensive error messages  
✅ **Database Persistence** - MongoDB integration  
✅ **RESTful API** - Clean, documented endpoints  

## 🚀 Performance

- Frontend build: ~210 KB (gzipped: 65 KB)
- API response time: <100ms
- Database queries optimized with indexes
- CSS minification enabled

## 📄 License

MIT

## 👤 Author

Created as a full-stack project demonstration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please create an issue on GitHub.

---

**Deployment Status**: [Add badges from Vercel]

```
Frontend: https://bexcode.vercel.app
Backend: https://bexcode-api.vercel.app
```
