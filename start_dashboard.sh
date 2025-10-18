#!/bin/bash

# S&P 500 Stock Viewer Startup Script
# Advanced US Stock Market Analysis Platform

echo "🚀 Starting S&P 500 Stock Viewer..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.11+${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Python found: $(python3 --version)"

# Check Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js found: $(node --version)"
echo ""

# Check/create virtual environment
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${BLUE}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install Python dependencies
echo -e "${BLUE}📦 Checking Python dependencies...${NC}"
pip install -q -r requirements.txt

# Check Node dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies (this may take a while)...${NC}"
    cd frontend
    npm install
    cd ..
fi

echo ""
echo -e "${GREEN}✅ Environment configured!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 S&P 500 Stock Viewer - US Stock Market Analysis${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Starting servers...${NC}"
echo ""

# Function to kill processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in background
echo -e "${BLUE}🔧 Starting API Backend (port 8000)...${NC}"
python -m uvicorn app.api.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend started
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Error starting backend. Check backend.log${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"

# Start frontend in background
echo -e "${BLUE}🎨 Starting Frontend (port 3000)...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

# Check if frontend started
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Error starting frontend. Check frontend.log${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ S&P 500 Stock Viewer is running!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📊 ${GREEN}Dashboard:${NC}    http://localhost:3000"
echo -e "🔧 ${GREEN}API Backend:${NC}  http://localhost:8000"
echo -e "📚 ${GREEN}API Docs:${NC}     http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   • Use Ctrl+C to stop the servers"
echo -e "   • Logs: backend.log and frontend.log"
echo -e "   • See README.md for more information"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
