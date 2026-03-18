# BexCode - Health Consultation Intake System

A full-stack application for collecting health consultation data with a React frontend and Node.js backend. Built with TypeScript, MongoDB, and modern web technologies.

## Project Overview

This is a complete interview project demonstrating:

- ✅ **React + TypeScript** frontend with dynamic questionnaires
- ✅ **Node.js + Express + TypeScript** backend API
- ✅ **MongoDB** database for data persistence
- ✅ **Form validation** (frontend and backend)
- ✅ **Timezone capture** and UTC timestamps
- ✅ **Conditional questions** based on responses
- ✅ **RESTful API** with CORS support
- ✅ **Error handling** and logging

## Project Structure

```
bexcode-health-consultation/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DynamicQuestionnaire.tsx    # Renders questions dynamically
│   │   │   └── IntakeConsultForm.tsx      # Main form component
│   │   ├── utils/
│   │   │   ├── conditionalLogic.ts        # Handles conditional questions
│   │   │   ├── responseParser.ts          # Parses form responses
│   │   │   └── timezone.ts                # Captures user timezone
│   │   ├── types/
│   │   │   └── forms.ts                   # Shared TypeScript types
│   │   └── data/
│   │       └── questionnaire.json         # Question definitions
│   ├── package.json
│   ├── vite.config.ts                     # Vite build config
│   └── README.md                          # Frontend documentation
│
├── backend/
│   ├── src/
│   │   ├── index.ts                       # Express server entry point
│   │   ├── config/database.ts             # MongoDB connection
│   │   ├── models/Consultation.ts         # MongoDB schema
│   │   ├── controllers/consultationController.ts  # Business logic
│   │   ├── routes/index.ts                # API endpoints
│   │   ├── middleware/index.ts            # Error handling middleware
│   │   ├── types/index.ts                 # TypeScript interfaces
│   │   └── utils/validation.ts            # Input validation
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── example-submission.json            # Test data
│   ├── README.md                          # Backend API documentation
│   ├── SETUP.md                           # Setup instructions
│   └── ARCHITECTURE.md                    # Design decisions (for interview)
│
└── README.md                              # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git (optional)

### 1. Start Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start server (requires MongoDB to be running)
npm run dev
```

**Backend runs on**: `http://localhost:5000`

### 2. Start Frontend

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend runs on**: `http://localhost:5173`

### 3. Test Connection

Open browser to `http://localhost:5173` and submit a consultation. You should see it saved in MongoDB.

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

| Method | Endpoint               | Purpose                   |
| ------ | ---------------------- | ------------------------- |
| GET    | `/health`              | Check API status          |
| POST   | `/consultations`       | Submit new consultation   |
| GET    | `/consultations`       | Get all submissions       |
| GET    | `/consultations/:id`   | Get specific submission   |
| GET    | `/consultations/stats` | Get submission statistics |

### Example: Submit Consultation

**Request:**

```bash
curl -X POST http://localhost:5000/api/consultations \
  -H "Content-Type: application/json" \
  -d '{
    "userDetails": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "dateOfBirth": "1995-06-15"
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
      "submittedAt": "2024-03-17T14:30:00.000Z"
    }
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "message": "Consultation submitted successfully"
  },
  "timestamp": "2024-03-17T10:00:00.000Z"
}
```

See [backend/README.md](./backend/README.md) for complete API documentation.

## Data Structure

### Question Response Format

Every question produces exactly **one answer field**:

```typescript
interface QuestionResponse {
  questionId: string; // "q1", "q2", etc.
  questionType: QuestionType; // "radio" | "select" | "multi-select" | "compound"
  answer: string; // Always a string
}
```

**Examples:**

```json
{
  "questionId": "q1",
  "questionType": "radio",
  "answer": "Yes"
}

{
  "questionId": "q2",
  "questionType": "multi-select",
  "answer": "Diabetes, Hypertension, Obesity"
}

{
  "questionId": "q4",
  "questionType": "compound",
  "answer": "5 feet 6 inches"
}
```

### Complete Submission Structure

```typescript
interface ConsultationSubmission {
  userDetails: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  responses: QuestionResponse[];
  metadata: {
    timezone: string; // User's timezone
    submittedAt: string; // ISO 8601 UTC timestamp
  };
}
```

## Key Features

### 1. Dynamic Questionnaire

- Questions loaded from `questionnaire.json`
- Supports multiple question types
- Conditional questions based on responses
- Client-side validation

### 2. Timezone Capture

- Automatically detects user's timezone
- Stores timezone in metadata
- Server stores submission time in UTC
- Preserves user's local time context

### 3. Validation (Frontend & Backend)

- **Frontend**: Immediate user feedback
- **Backend**: Security validation (don't trust client)
- **Database**: Schema constraints

### 4. Conditional Questions (Bonus)

- If user selects "Pregnant", show "Select Trimester"
- Logic is schema-driven in `questionnaire.json`
- Not hardcoded in UI

### 5. Error Handling

- Standardized error responses
- Detailed validation error messages
- Server logging for debugging

## Development

### Frontend Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (fast development)
- **CSS** - Styling

### Backend Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM

### TypeScript Throughout

Both frontend and backend use TypeScript for:

- Type safety
- Better IDE support
- Self-documenting code
- Catch errors early

## Database Setup

### Option 1: Local MongoDB

```bash
# Windows
mongod

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Option 2: MongoDB Atlas (Cloud - Easiest)

1. Create account: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Add to backend `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/consultations
   ```

### Option 3: Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Get all submissions
curl http://localhost:5000/api/consultations

# Submit test consultation
curl -X POST http://localhost:5000/api/consultations \
  -H "Content-Type: application/json" \
  -d @backend/example-submission.json
```

### View Data in MongoDB

Using MongoDB Compass or shell:

```bash
use consultations
db.consultations.find().pretty()
```

## Troubleshooting

### Backend won't start

- Check MongoDB is running
- Check `.env` file exists
- Verify port 5000 is not in use

### CORS errors

- Check backend `.env` has correct `CORS_ORIGIN`
- Restart backend after changing `.env`

### Frontend can't reach backend

- Verify backend is running on port 5000
- Check browser console for network errors
- Verify both are running in development mode

## For Your Interview

### Key Talking Points

1. **Full Stack**: "I built both frontend and backend to demonstrate end-to-end development"

2. **TypeScript**: "Using TypeScript throughout provides type safety and catches errors early"

3. **Architecture**: "I used a 3-layer architecture (routes → controllers → models) for clean, maintainable code"

4. **Validation**: "Validation happens both frontend (UX) and backend (security). Never trust the client."

5. **Data Normalization**: "Every question produces exactly one answer field, which simplifies processing and storage"

6. **Timezone**: "Capturing timezone and storing UTC timestamps preserves user context while maintaining data consistency"

7. **Error Handling**: "All errors are caught and returned in a standardized format so the frontend can handle them gracefully"

### Documents for Interview Prep

- [Backend Architecture](./backend/ARCHITECTURE.md) - Design decisions and talking points
- [Backend Setup](./backend/SETUP.md) - How to run locally
- [Backend README](./backend/README.md) - Complete API documentation
- [Frontend README](./frontend/README.md) - Frontend documentation

### Interview Demo

```bash
# 1. Show code structure
# 2. Run frontend: npm run dev (frontend/)
# 3. Run backend: npm run dev (backend/)
# 4. Fill out form in browser
# 5. Show data in MongoDB Compass
# 6. Show API response in network tab
# 7. Explain architecture and design choices
```

## Build for Production

### Frontend

```bash
cd frontend
npm run build
# Output: dist/ folder
```

### Backend

```bash
cd backend
npm run build
npm start
# Runs compiled JavaScript from dist/
```

## Next Steps

- [ ] Add user authentication (JWT)
- [ ] Add admin dashboard
- [ ] Implement data export (CSV, PDF)
- [ ] Add unit tests
- [ ] Deploy to production (Vercel, Heroku)
- [ ] Add more question types
- [ ] Implement pagination
- [ ] Add email notifications

## Technology Stack Summary

| Layer    | Technology        |
| -------- | ----------------- |
| Language | TypeScript        |
| Frontend | React 18, Vite    |
| Backend  | Node.js, Express  |
| Database | MongoDB, Mongoose |
| API      | REST with CORS    |
| Styling  | CSS               |

## Questions?

See detailed documentation:

- [Backend README](./backend/README.md)
- [Backend Architecture](./backend/ARCHITECTURE.md)
- [Frontend README](./frontend/README.md)

## License

This is a demonstration project for educational purposes.
