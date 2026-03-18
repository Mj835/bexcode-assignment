# Setup Guide for Backend Development

## Quick Start (Windows)

### Step 1: Start MongoDB

**Option A: Local MongoDB Installation** (if you have MongoDB installed)

```bash
# Run MongoDB daemon
mongod
```

**Option B: Using Docker**

```bash
# Make sure Docker is installed, then run:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# To stop later:
docker stop mongodb

# To start again:
docker start mongodb

# View MongoDB logs:
docker logs mongodb
```

**Option C: MongoDB Atlas (Cloud - Easiest)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get the connection string
5. Update in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/consultations?retryWrites=true&w=majority
   ```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Start the Server

```bash
# Windows: Double-click start-dev.bat
# Or run in terminal:
npm run dev

# Linux/Mac: Run
./start-dev.sh
```

You should see:

```
✓ Connected to MongoDB
✓ Server is running on http://localhost:5000
✓ CORS enabled for: http://localhost:5173
```

### Step 4: Test the API

**In another terminal, test health check:**

```bash
curl http://localhost:5000/api/health
```

**Submit a test consultation:**

```bash
curl -X POST http://localhost:5000/api/consultations ^
  -H "Content-Type: application/json" ^
  -d @example-submission.json
```

### Step 5: Start Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend will be at `http://localhost:5173`

## Verify Setup

1. ✅ Backend running on `http://localhost:5000`
2. ✅ Frontend running on `http://localhost:5173`
3. ✅ MongoDB connected
4. ✅ CORS enabled between frontend and backend
5. ✅ Can submit consultations and see data in MongoDB

## View Data in MongoDB

### Option 1: MongoDB Compass (GUI)

1. Download https://www.mongodb.com/products/tools/compass
2. Connect to `mongodb://localhost:27017`
3. Browse `consultations` database → `consultations` collection

### Option 2: MongoDB Shell

```bash
mongo

# Switch to database
use consultations

# View all consultations
db.consultations.find()

# View count
db.consultations.count()

# View specific
db.consultations.findOne()
```

### Option 3: Command Line

```bash
# Using MongoDB installed on system
mongo localhost:27017/consultations --eval "db.consultations.find().pretty()"
```

## Common Issues

### Error: "connect ECONNREFUSED 127.0.0.1:27017"

- **Problem**: MongoDB is not running
- **Solution**: Start MongoDB (see Step 1 above)

### Error: "Cannot find module 'typescript'"

- **Problem**: Dependencies not installed
- **Solution**: Run `npm install` in backend folder

### CORS errors in browser console

- **Problem**: Frontend and backend not configured correctly
- **Solution**:
  - Check `.env` has `CORS_ORIGIN=http://localhost:5173`
  - Restart backend after changing `.env`

### Port 5000 already in use

- **Problem**: Another app is using port 5000
- **Solution**:
  - Change `PORT` in `.env` to something like 5001
  - Or kill the process: `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)

## Development Workflow

1. **Make changes to TypeScript files** in `src/`
2. **Auto-compilation**: The server auto-restarts when files change
3. **Check console** for errors
4. **Test with frontend** or cURL

## Project Structure Explained

```
backend/
├── src/
│   ├── index.ts                    # Main server - Express setup
│   ├── config/database.ts          # MongoDB connection logic
│   ├── models/Consultation.ts      # MongoDB schema (what data looks like)
│   ├── controllers/
│   │   └── consultationController.ts # Business logic (submit, fetch, stats)
│   ├── routes/index.ts             # API endpoints (POST, GET, etc.)
│   ├── middleware/index.ts         # Error handling, logging
│   ├── types/index.ts              # TypeScript interfaces (data types)
│   └── utils/validation.ts         # Input validation rules
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── .env.example                    # Environment template (copy to .env)
└── README.md                       # Full documentation
```

## For Your Interview

**Talking Points:**

1. "I used Express because it's a simple, industry-standard framework for Node.js"
2. "TypeScript provides type safety - I catch errors early"
3. "MongoDB with Mongoose gives us flexible schema and easy queries"
4. "Validation happens on both frontend and backend for security"
5. "Timezone is captured from frontend and UTC timestamp stored server-side"
6. "The controller-route-model structure keeps code organized and maintainable"
7. "CORS allows the frontend to safely communicate with backend"

## Next: Connect Frontend to Backend

See frontend `IntakeConsultForm.tsx` for how to integrate the API calls.

The endpoint is: `POST http://localhost:5000/api/consultations`

Send it the data structure from `example-submission.json`
