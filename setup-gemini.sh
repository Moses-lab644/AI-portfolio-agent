#!/bin/bash

# Gemini AI Chat Integration Setup Script

echo "======================================"
echo "Gemini AI Integration Setup"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file in the project root"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if grep -q "GEMINI_API_KEY=your-gemini-api-key-here" .env; then
    echo "⚠️  GEMINI_API_KEY not configured"
    echo ""
    echo "Steps to get your API key:"
    echo "1. Go to https://aistudio.google.com/app/apikeys"
    echo "2. Click 'Create API Key'"
    echo "3. Copy the key"
    echo "4. Update .env file: GEMINI_API_KEY=your-actual-key"
    echo ""
    read -p "Press Enter after updating .env..."
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js 16+ is required (you have v$NODE_VERSION)"
    exit 1
fi

echo "✅ Node.js version check passed"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add GEMINI_API_KEY to .env"
echo "2. Run: npm start"
echo "3. Open http://localhost:3000"
echo "4. Login and test the chat feature"
echo ""
echo "For troubleshooting, see SETUP_GEMINI.md"
