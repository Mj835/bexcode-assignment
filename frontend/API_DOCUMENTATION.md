# Health Intake Consultation API Documentation

## Base URL

```
http://localhost:5000/api
```

## Overview

The Health Intake Consultation API allows you to submit, retrieve, and analyze health consultation data from patients. All responses follow a standardized format with success status, data, and timestamp information.

---

## Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Description:** Verify that the API server is running.

**Request:**

```bash
curl http://localhost:5000/api/health
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "API is running"
  },
  "timestamp": "2026-03-17T10:30:00.000Z"
}
```

---

### 2. Submit Consultation

**Endpoint:** `POST /consultations`

**Description:** Submit a completed health consultation form.

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "userDetails": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "dateOfBirth": "YYYY-MM-DD"
  },
  "responses": [
    {
      "questionId": "string",
      "questionType": "radio|select|multi-select|compound",
      "answer": "string"
    }
  ],
  "metadata": {
    "timezone": "string (IANA timezone e.g., America/New_York)",
    "submittedAt": "ISO 8601 UTC timestamp"
  }
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/consultations \
  -H "Content-Type: application/json" \
  -d '{
    "userDetails": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "dateOfBirth": "1990-06-15"
    },
    "responses": [
      {
        "questionId": "q1",
        "questionType": "radio",
        "answer": "Yes"
      },
      {
        "questionId": "q2",
        "questionType": "multi-select",
        "answer": "Diabetes , Hypertension"
      }
    ],
    "metadata": {
      "timezone": "America/New_York",
      "submittedAt": "2026-03-17T10:30:00.000Z"
    }
  }'
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "message": "Consultation submitted successfully"
  },
  "timestamp": "2026-03-17T10:30:15.000Z"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Validation failed",
  "data": {
    "errors": ["fullName is required", "email must be a valid email"]
  },
  "timestamp": "2026-03-17T10:30:15.000Z"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Failed to submit consultation",
  "timestamp": "2026-03-17T10:30:15.000Z"
}
```

---

### 3. Get All Consultations

**Endpoint:** `GET /consultations`

**Description:** Retrieve all submitted consultations. (Admin/Demo endpoint)

**Request:**

```bash
curl http://localhost:5000/api/consultations
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userDetails": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "phone": "555-1234",
        "dateOfBirth": "1990-06-15"
      },
      "responses": [...],
      "metadata": {...},
      "createdAt": "2026-03-17T10:30:00.000Z"
    }
  ],
  "timestamp": "2026-03-17T10:30:15.000Z"
}
```

---

### 4. Get Consultation by ID

**Endpoint:** `GET /consultations/:id`

**Description:** Retrieve a specific consultation by ID.

**Parameters:**

- `id` (path) - MongoDB consultation ID

**Request:**

```bash
curl http://localhost:5000/api/consultations/507f1f77bcf86cd799439011
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userDetails": {...},
    "responses": [...],
    "metadata": {...},
    "createdAt": "2026-03-17T10:30:00.000Z"
  },
  "timestamp": "2026-03-17T10:30:15.000Z"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Consultation not found",
  "timestamp": "2026-03-17T10:30:15.000Z"
}
```

---

### 5. Get Consultation Statistics

**Endpoint:** `GET /consultations/stats`

**Description:** Retrieve statistics about submitted consultations.

**Request:**

```bash
curl http://localhost:5000/api/consultations/stats
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalSubmissions": 42,
    "commonResponses": {
      "q1": {
        "Yes": 28,
        "No": 14
      },
      "q2": {
        "Diabetes": 12,
        "Hypertension": 25
      }
    },
    "averageResponseTime": "2.5 minutes",
    "lastSubmission": "2026-03-17T10:30:00.000Z"
  },
  "timestamp": "2026-03-17T10:30:15.000Z"
}
```

---

## Data Validation Rules

### User Details

- **fullName**: Required, 2-100 characters
- **email**: Required, valid email format
- **phone**: Required, valid phone format
- **dateOfBirth**: Required, valid date in YYYY-MM-DD format

### Responses

- **questionId**: Required, unique identifier
- **questionType**: Required, one of: radio, select, multi-select, compound
- **answer**: Required, non-empty string

### Metadata

- **timezone**: Required, IANA timezone format (auto-detected on frontend)
- **submittedAt**: Required, ISO 8601 UTC timestamp

---

## Response Format

All API responses follow this standard structure:

```json
{
  "success": boolean,
  "data": any,
  "error": "string (only on failure)",
  "timestamp": "ISO 8601 UTC timestamp"
}
```

**Fields:**

- `success` - Whether the request succeeded
- `data` - Response payload (varies by endpoint)
- `error` - Error message (only present on failure)
- `timestamp` - Server timestamp when response was generated

---

## HTTP Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request (consultation created)
- `400 Bad Request` - Validation error or malformed request
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Example Workflow

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 2. Submit a consultation from frontend

```javascript
const payload = {
  userDetails: {...},
  responses: [...],
  metadata: {
    timezone: detectUserTimezone(),
    submittedAt: getCurrentUTCTimestamp()
  }
};

const response = await fetch('http://localhost:5000/api/consultations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

const result = await response.json();
if (result.success) {
  console.log('Consultation saved with ID:', result.data.id);
}
```

### 3. Retrieve submitted consultations

```javascript
const response = await fetch("http://localhost:5000/api/consultations");
const result = await response.json();
console.log("All consultations:", result.data);
```

---

## Error Handling

Always check the `success` field in the response:

```javascript
if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  console.error(result.error);
  if (result.data?.errors) {
    console.error("Validation errors:", result.data.errors);
  }
}
```

---

## CORS

The API is configured to accept requests from the frontend running on:

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Common dev port)

---

## Rate Limiting

Currently no rate limiting is implemented. This may be added in production.

---

## Future Enhancements

- Authentication/Authorization
- Pagination for list endpoints
- Advanced filtering and search
- Data export (CSV, PDF)
- Scheduled reports
- Real-time notifications
