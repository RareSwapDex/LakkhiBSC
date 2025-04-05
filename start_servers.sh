#!/bin/bash

# Kill any existing processes on ports 3000 and 8000
echo "Killing any existing processes on ports 3000 and 8000..."
pkill -f "node|react-scripts|python.*runserver" || true

# Start backend server
echo "Starting backend server..."
cd ~/projects/lakkhi-program/integrated-app/backend
source venv/bin/activate
nohup python manage.py runserver 8000 > backend.log 2>&1 &
echo "Backend server started on http://localhost:8000"

# Wait a moment to ensure backend is starting
sleep 2

# Start frontend server
echo "Starting frontend server..."
cd ~/projects/lakkhi-program/integrated-app/frontend
nohup npm start > frontend.log 2>&1 &
echo "Frontend server started on http://localhost:3000"

echo "Both servers have been started."
echo "View backend logs: tail -f ~/projects/lakkhi-program/integrated-app/backend/backend.log"
echo "View frontend logs: tail -f ~/projects/lakkhi-program/integrated-app/frontend/frontend.log" 