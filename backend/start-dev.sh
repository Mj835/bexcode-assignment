#!/bin/bash
# Quick start script for development

echo "🚀 Starting Health Consultation Backend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env created. Please update with your configuration if needed."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start in development mode
echo "🔧 Starting dev server with auto-reload..."
npm run dev
