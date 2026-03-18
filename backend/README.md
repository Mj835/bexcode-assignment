# Backend API - Health Consultation System

A simple Node.js + Express + TypeScript backend API for capturing and storing health consultation questionnaires with MongoDB.

## Features

- ✅ **Node.js + Express**: Simple and fast REST API
- ✅ **TypeScript**: Type-safe code across the entire backend
- ✅ **MongoDB**: Persistent data storage with Mongoose ODM
- ✅ **Validation**: Comprehensive input validation for all submissions
- ✅ **CORS Support**: Cross-origin requests for frontend integration
- ✅ **Error Handling**: Structured error responses and logging
- ✅ **Timezone Support**: Captures user timezone and UTC timestamps
- ✅ **Statistics**: Endpoint for submission analytics

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts        # MongoDB connection
│   ├── controllers/
│   │   └── consultationController.ts  # Business logic
│   ├── middleware/
│   │   └── index.ts           # Express middleware
│   ├── models/
│   │   └── Consultation.ts    # MongoDB schema
│   ├── routes/
│   │   └── index.ts           # API routes
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── utils/
│   │   └── validation.ts      # Validation functions
│   └── index.ts               # Main server file
├── package.json
├── tsconfig.json
└── .env.example
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/consultations
CORS_ORIGIN=http://localhost:5173
```

**Database Options:**

- **Local MongoDB**: `mongodb://localhost:27017/consultations`
- **MongoDB Atlas** (Cloud): `mongodb+srv://username:password@cluster.mongodb.net/consultations?retryWrites=true&w=majority`

### 3. Start MongoDB

**Local MongoDB:**

```bash
# On Windows with MongoDB installed
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run the Server

**Development mode** (with auto-restart on changes):

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Health Check

```
GET /api/health
```

Response:

```json
{
  "success": true,
  "data": { "message": "API is running" },
  "timestamp": "2024-03-17T10:00:00.000Z"
}
```

### 2. Submit Consultation ⭐

```
POST /api/consultations
Content-Type: application/json
```

**Request Body:**

```json
{
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
      "answer": "No"
    },
    {
      "questionId": "q2",
      "questionType": "multi-select",
      "answer": "Diabetes , Hypertension"
    }
  ],
  "metadata": {
    "timezone": "America/New_York",
    "submittedAt": "2024-03-17T14:30:00.000Z"
  }
}
```

**Success Response (201):**

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

**Validation Error Response (400):**

```json
{
  "success": false,
  "error": "Validation failed",
  "data": {
    "errors": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "fullName", "message": "Full name is required" }
    ]
  },
  "timestamp": "2024-03-17T10:00:00.000Z"
}
```

### 3. Get All Consultations

```
GET /api/consultations
```

Returns the 50 most recent submissions.

### 4. Get Specific Consultation

```
GET /api/consultations/:id
```

Example:

```
GET /api/consultations/65f8a1b2c3d4e5f6g7h8i9j0
```

### 5. Get Statistics

```
GET /api/consultations/stats
```

Response:

```json
{
  "success": true,
  "data": {
    "totalSubmissions": 25,
    "timezoneDistribution": [
      { "_id": "America/New_York", "count": 12 },
      { "_id": "America/Los_Angeles", "count": 8 },
      { "_id": "Europe/London", "count": 5 }
    ]
  },
  "timestamp": "2024-03-17T10:00:00.000Z"
}
```

## Data Validation Rules

### User Details

- **Full Name**: Required, minimum 2 characters
- **Email**: Required, valid email format
- **Phone**: Required, minimum 10 digits
- **Date of Birth**: Required, valid date, not in the future

### Responses

- **Question ID**: Required, non-empty string
- **Question Type**: Required, one of: `radio`, `select`, `multi-select`, `compound`
- **Answer**: Required, non-empty string

### Metadata

- **Timezone**: Required (e.g., `America/New_York`)
- **Submitted At**: Required, ISO 8601 format UTC timestamp

## Frontend Integration

### Example: Submitting from React

```typescript
import { ConsultationSubmission } from "../types";

const submission: ConsultationSubmission = {
  userDetails: {
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    dateOfBirth: formData.dateOfBirth,
  },
  responses: responses.map((r) => ({
    questionId: r.questionId,
    questionType: r.questionType,
    answer: r.answer, // Always string
  })),
  metadata: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    submittedAt: new Date().toISOString(),
  },
};

const response = await fetch("http://localhost:5000/api/consultations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(submission),
});

const result = await response.json();
if (result.success) {
  console.log("Submission ID:", result.data.id);
}
```

## Error Handling

All endpoints return a consistent response format:

```json
{
  "success": boolean,
  "data": object | undefined,
  "error": string | undefined,
  "timestamp": string (ISO 8601)
}
```

### Common HTTP Status Codes

- **200**: Success (GET requests)
- **201**: Created (POST requests)
- **400**: Validation error
- **404**: Resource not found
- **500**: Server error

## Development Tips

### Testing with cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Submit consultation
curl -X POST http://localhost:5000/api/consultations \
  -H "Content-Type: application/json" \
  -d @consultation.json

# Get all consultations
curl http://localhost:5000/api/consultations

# Get statistics
curl http://localhost:5000/api/consultations/stats
```

### Testing with Postman

1. Import the API endpoints into Postman
2. Use the request examples from this documentation
3. Or auto-generate from the API using Tools > API Network

### Debugging

- Check console logs: `npm run dev` shows all requests and errors
- Check MongoDB: Use MongoDB Compass to view data directly
- Network tab in browser DevTools to inspect API calls from frontend

## Production Deployment

### Environment Setup

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/consultations
CORS_ORIGIN=https://yourdomain.com
```

### Build and Run

```bash
npm run build
npm start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["npm", "start"]
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Interview Talking Points

1. **Architecture**: Simple 3-layer architecture (routes → controllers → models)
2. **Validation**: Comprehensive client-side validation in types, server-side in utils
3. **Database**: MongoDB schema matches the expected data structure exactly
4. **Error Handling**: All errors return consistent JSON format with clear messages
5. **Timezone Support**: Captures timezone and stores UTC timestamps
6. **TypeScript**: Full type safety across entire backend
7. **Scalability**: Ready for features like authentication, pagination, filtering

## Next Steps (Future Enhancements)

- [ ] User authentication (JWT)
- [ ] Pagination for large datasets
- [ ] Advanced filtering and search
- [ ] Data export (CSV, PDF)
- [ ] Email notifications
- [ ] Rate limiting
- [ ] API documentation with Swagger/OpenAPI
- [ ] Unit tests with Jest
- [ ] Database backup automation

## Support

For issues or questions, refer to the inline code comments or the main [README.md](../README.md) in the project root.
