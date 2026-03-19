# BexCode Frontend - Health Consultation Intake System

A modern React + TypeScript web application for collecting health consultation intake data through dynamic questionnaires.

## Features

- **Dynamic Questionnaire System**: Flexible question rendering with conditional logic
- **Form Validation**: Real-time validation with error messages
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Type-Safe**: Full TypeScript implementation
- **API Integration**: Seamless backend communication

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **ESLint** - Code quality

## Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── DynamicQuestionnaire.tsx
│   │   └── IntakeConsultForm.tsx
│   ├── utils/           # Utility functions
│   │   ├── api.ts       # API client
│   │   ├── conditionalLogic.ts
│   │   ├── responseParser.ts
│   │   └── timezone.ts
│   ├── types/           # TypeScript types
│   ├── data/            # Static data (questionnaire.json)
│   ├── styles/          # CSS files
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Environment Variables

Create a `.env.local` file in the project root:

```
VITE_API_URL=http://localhost:5000/api
```

For production (Vercel), set environment variable:

```
VITE_API_URL=https://bexcode-assignment-backend.vercel.app/api
```

## Components

### DynamicQuestionnaire

Renders questions based on type (radio, select, checkbox, compound) with conditional logic support.

### IntakeConsultForm

Main form component that manages form state, validation, and API submission.

## API Communication

The frontend communicates with the backend API at `/api/consultations` endpoint.

**Submit Consultation:**

```
POST /api/consultations
Content-Type: application/json

{
  "userDetails": { ... },
  "responses": [ ... ],
  "metadata": { ... }
}
```

## Build & Deployment

The project is configured for deployment on **Vercel**:

1. Push code to GitHub
2. Vercel auto-deploys on push to main
3. Set environment variables in Vercel dashboard
4. Production URL: https://bexcode.vercel.app

```

```
