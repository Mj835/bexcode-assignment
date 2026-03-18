# Backend Architecture & Design Decisions

This document explains the architecture of the backend API and the reasoning behind each design choice. Use this as your talking points for the interview.

## Overview

The backend follows a **3-layer architecture pattern**:

```
Routes (API Endpoints)
    ↓
Controllers (Business Logic)
    ↓
Models (Database)
```

This separation makes the code clean, testable, and maintainable.

## Why Node.js + Express?

- **Node.js**: JavaScript runtime perfect for I/O-heavy operations (reading/writing to database)
- **Express**: Lightweight, simple framework with minimal setup overhead
- **Interview talking point**: "Express handles request routing and middleware easily. It's battle-tested and widely used in production."

## Why TypeScript?

- **Type Safety**: Prevents runtime errors by catching type mismatches at compile time
- **Better IDE Support**: Autocomplete and refactoring tools work better
- **Self-Documenting**: Function signatures show exactly what data they expect
- **Interview talking point**: "TypeScript caught errors during development that would have been hard to debug in production. For example, if someone passes a number instead of a string to a field, TypeScript catches it immediately."

## Architecture Layers

### 1. Routes (`src/routes/index.ts`)

**Purpose**: Define API endpoints

```typescript
router.post("/consultations", submitConsultation);
router.get("/consultations/:id", getConsultationById);
```

**Interview talking point**: "Routes act as the 'entry point' - they define what endpoints exist and what HTTP methods are allowed. This keeps all endpoints in one place for easy reference."

---

### 2. Controllers (`src/controllers/consultationController.ts`)

**Purpose**: Handle business logic (validation, database calls, response formatting)

**Example:**

```typescript
export async function submitConsultation(req: Request, res: Response) {
  // 1. Validate input
  const validationErrors = validateConsultationSubmission(data);

  // 2. Save to database
  const saved = await consultation.save();

  // 3. Return response
  res.status(201).json(response);
}
```

**Interview talking point**: "Controllers orchestrate the workflow. They don't know about HTTP details (that's routes), and they use utilities for validation. This separation means if I need to call the same logic from a different endpoint or a scheduled job, I can reuse it."

---

### 3. Models (`src/models/Consultation.ts`)

**Purpose**: Define database schema and data structure

```typescript
const consultationSchema = new Schema({
  userDetails: { ... },      // What does user info look like?
  responses: [ ... ],        // What does a question response look like?
  metadata: { ... },         // What metadata do we store?
});
```

**Interview talking point**: "The schema enforces data consistency. MongoDB requires us to be explicit about structure, which prevents storing malformed data accidentally."

---

## Key Design Decisions

### 1. Validation Strategy

**Approach**: Validate both client-side AND server-side

```
Frontend Validation (User Experience)
         ↓
    Server Validation (Security)
         ↓
    Database Constraint (Data Integrity)
```

**Why all three?**

- **Frontend validation**: Users see errors immediately
- **Server validation**: Protects against malicious requests (can't trust browser)
- **Database constraints**: Last line of defense

**Interview talking point**: "I never trust the frontend. A malicious user could bypass frontend validation with browser DevTools. That's why I validate again on the server before saving to the database."

**Code Example:**

```typescript
// src/utils/validation.ts
export function validateConsultationSubmission(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  errors.push(...validateUserDetails(data.userDetails));
  errors.push(...validateResponses(data.responses));
  errors.push(...validateMetadata(data.metadata));
  return errors;
}
```

### 2. Response Format (Standardization)

**Every API response follows this format:**

```json
{
  "success": boolean,
  "data": { ... },           // Only on success
  "error": "string",         // Only on error
  "timestamp": "ISO 8601"    // Always included
}
```

**Why?**

- Frontend always knows what to expect
- Easy to parse errors
- Timestamp helps with debugging
- Professional (matches enterprise APIs)

**Interview talking point**: "Standardizing the response format means the frontend doesn't need to handle 5 different response types. Everything is predictable, which reduces bugs."

### 3. Timezone Capture

**Approach:**

```
1. Frontend detects timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
2. Frontend sends it with submission
3. Backend stores it in metadata
4. Backend stores submission time in UTC
```

**Why?**

- **Timezone**: User's location context (needed for pills-per-day schedules, appointment scheduling)
- **UTC timestamp**: Sortable, comparable across timezones, always unambiguous

**Interview talking point**: "Storing both timezone and UTC timestamp means we can reconstruct the exact local time the submission happened, even if the user travels. This is important for medical data."

### 4. Question Response Design

**Key constraint**: "Every question produces exactly one answer field"

```
// ❌ Wrong - different fields for different types
{
  "radioAnswer": "Yes",
  "multiSelectAnswers": ["A", "B"],
  "compoundAnswer": "5 feet 6 inches"
}

// ✅ Correct - always same field
{
  "questionId": "q1",
  "questionType": "radio",
  "answer": "Yes"              // Single field, always
}

{
  "questionId": "q2",
  "questionType": "multi-select",
  "answer": "A, B"             // Multi-select as comma-separated
}

{
  "questionId": "q4",
  "questionType": "compound",
  "answer": "5 feet 6 inches"  // Compound as formatted string
}
```

**Why?**

- **Flexibility**: Can parse/process all answers the same way
- **Storage**: Simpler database schema
- **Reporting**: Easy to export all answers without special cases
- **Future-proof**: Adding new question types doesn't require schema changes

**Interview talking point**: "This design choice makes data handling much simpler. I don't need special logic to handle different question types. Everything is normalized."

### 5. Error Handling

**Strategy:**

```
Try-Catch
    ↓
Catch & Log
    ↓
Return standardized error response
    ↓
Global error handler catches anything we missed
```

**Code Example:**

```typescript
try {
  // Business logic
  const saved = await consultation.save();
} catch (error) {
  console.error("Error:", error); // Log for debugging

  const response: ApiResponse = {
    success: false,
    error: "Failed to submit consultation",
    timestamp: new Date().toISOString(),
  };
  res.status(500).json(response);
}
```

**Interview talking point**: "I never let the server crash silently. Every error is logged, and the frontend always gets a proper error response to show to the user."

### 6. CORS Configuration

```typescript
app.use(
  cors({
    origin: CORS_ORIGIN, // Only allow frontend domain
    credentials: true,
  }),
);
```

**Why?**

- **Security**: Prevents requests from other domains
- **Explicit**: Clear which origins are allowed

**Interview talking point**: "CORS is a security feature. By explicitly allowing only our frontend domain, we prevent cross-site attacks. If we had set origin to '\*', any website could talk to our API."

---

## Data Flow Example: Submit Consultation

```
1. User fills out form in frontend
   ↓
2. User clicks "Submit"
   ↓
3. Frontend validates locally
   ↓
4. Frontend sends POST /api/consultations with JSON body
   ↓
5. Backend Route Handler
   - Extracts request body
   - Calls controller
   ↓
6. Controller (submitConsultation)
   - Calls validation utility
   - If errors: return 400 with errors
   - If valid: creates Consultation document
   ↓
7. Model (Consultation)
   - Schema validates fields
   - Enforces types (string, required, etc.)
   ↓
8. Database (MongoDB)
   - Stores document
   - Returns _id (unique identifier)
   ↓
9. Controller returns success response
   ↓
10. Frontend gets response
    - If success: show "Submitted!"
    - If error: show validation errors
```

---

## Testing the Architecture

### Test 1: Validation Works

```bash
# Send invalid email - should get 400
curl -X POST http://localhost:5000/api/consultations \
  -d '{"userDetails":{"email":"invalid","fullName":"Test",...}}'
```

### Test 2: Data Persists

```bash
# Submit → Get statistics → Should see +1 count
POST /api/consultations
GET /api/consultations/stats
```

### Test 3: Timezone Captured

```bash
# View MongoDB
db.consultations.findOne();
// Should see: "metadata": {"timezone": "America/New_York", ...}
```

---

## Interview Script

**Q: "Tell me about your backend architecture"**

A: "I used a 3-layer architecture: Routes define endpoints, Controllers handle business logic, and Models define the database schema. This separation of concerns makes the code cleaner and easier to test. For example, I can change how validation works without touching the routes."

**Q: "Why TypeScript?"**

A: "TypeScript provides type safety. When I define that email should be a string, the compiler catches it if someone accidentally passes a number. This prevents runtime errors and makes debugging easier. Plus, the IDE autocomplete is much better."

**Q: "How do you handle validation?"**

A: "I validate on three levels: Frontend for UX, server for security, and database constraints for integrity. I never trust the frontend—a malicious user could bypass it with browser DevTools. So the server always validates again."

**Q: "How does timezone work?"**

A: "The frontend detects the user's timezone using the Intl API and sends it with the submission. The server stores both the timezone and the submission time in UTC. This way, we can reconstruct the exact local time for any user, anywhere in the world."

**Q: "Why this response format?"**

A: "I standardize all responses to have the same structure: success boolean, data on success, error message on failure, and always a timestamp. This is predictable for the frontend and matches how enterprise APIs work."

---

## Scalability Considerations

**Current Design:**

- Single Node process
- MongoDB on localhost
- No authentication
- No database indexes (except timestamp)

**For Production:**

1. Add authentication (JWT tokens)
2. Add rate limiting (protect from abuse)
3. Add database indexes (faster queries)
4. Deploy on server with MongoDB Atlas
5. Use environment variables for secrets
6. Add request logging/monitoring
7. Add API versioning (/api/v1/consultations)
8. Add pagination for large result sets

**Interview talking point**: "The current design is simple and educational. In a real production system, I would add authentication, rate limiting, and better database optimization. But for this project, simplicity helps explain the core concepts."

---

## Files in This Architecture

| File                                    | Purpose               | Interview Note                                                                            |
| --------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| `index.ts`                              | Express server setup  | "This is the entry point—it sets up Express, connects to database, and starts the server" |
| `routes/index.ts`                       | Endpoint definitions  | "Routes map HTTP requests to controller functions"                                        |
| `controllers/consultationController.ts` | Business logic        | "Controllers coordinate between routes and database"                                      |
| `models/Consultation.ts`                | MongoDB schema        | "The schema enforces what fields are required and what types they should be"              |
| `types/index.ts`                        | TypeScript interfaces | "These define the shape of data—the contract between frontend and backend"                |
| `utils/validation.ts`                   | Validation rules      | "All validation logic is centralized here for reusability"                                |
| `middleware/index.ts`                   | Error handling        | "Middleware handles errors and logging globally"                                          |

---

## Questions to Practice For Interview

- "What would you do differently if you had more time?"
- "How would you add user authentication?"
- "What's the most complex part of this backend?"
- "How would you optimize for large datasets?"
- "Why did you choose MongoDB over PostgreSQL?"
- "How would you test this?"
- "Where's the biggest security risk?"
- "How would you scale this?"

**Good answers:**

- Reference your code and explain decisions
- Show you understand tradeoffs
- Suggest improvements for production
- Explain why current design works for this project
