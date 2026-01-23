# Gemini AI Chat Integration Setup Script for Windows
# Run this in PowerShell as Administrator

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Gemini AI Integration Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file in the project root"
    exit 1
}

# Check if GEMINI_API_KEY is set
$envContent = Get-Content .env -Raw
if ($envContent -match "GEMINI_API_KEY=your-gemini-api-key-here") {
    Write-Host "⚠️  GEMINI_API_KEY not configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Steps to get your API key:" -ForegroundColor Yellow
    Write-Host "1. Go to https://aistudio.google.com/app/apikeys"
    Write-Host "2. Click 'Create API Key'"
    Write-Host "3. Copy the key"
    Write-Host "4. Update .env file: GEMINI_API_KEY=your-actual-key"
    Write-Host ""
    Read-Host "Press Enter after updating .env"
}

# Check Node.js version
$nodeVersion = node -v
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Add GEMINI_API_KEY to .env"
Write-Host "2. Run: npm start"
Write-Host "3. Open http://localhost:3000"
Write-Host "4. Login and test the chat feature"
Write-Host ""
Write-Host "For troubleshooting, see SETUP_GEMINI.md" -ForegroundColor Yellow
