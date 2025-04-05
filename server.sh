#!/bin/bash

# Kill any existing processes
echo "Stopping any existing servers..."
pkill -f "node|react-scripts|python.*runserver" > /dev/null 2>&1

# Create log directory
mkdir -p /home/ryan/projects/lakkhi-program/logs

# Clear logs
> /home/ryan/projects/lakkhi-program/logs/backend.log
> /home/ryan/projects/lakkhi-program/logs/frontend.log

# Start backend properly redirecting ALL output
echo "Starting backend server..."
cd /home/ryan/projects/lakkhi-program/integrated-app/backend
source venv/bin/activate
nohup python manage.py runserver 8000 > /home/ryan/projects/lakkhi-program/logs/backend.log 2>&1 </dev/null &
echo "Backend server started! (Port 8000)"

# Start frontend properly redirecting ALL output
echo "Starting frontend server..."
cd /home/ryan/projects/lakkhi-program/integrated-app/frontend
nohup npm start > /home/ryan/projects/lakkhi-program/logs/frontend.log 2>&1 </dev/null &
echo "Frontend server started! (Port 3000)"

echo ""
echo "✓ Both servers are running in background processes"
echo "✓ Server output will not interrupt your terminal"
echo "✓ Viewing files will not cause terminal disconnects"
echo ""
echo "Visit:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:8000"
echo ""
echo "To view logs:"
echo "- Backend: cat /home/ryan/projects/lakkhi-program/logs/backend.log"
echo "- Frontend: cat /home/ryan/projects/lakkhi-program/logs/frontend.log"
echo ""
echo "To stop servers:"
echo "- Run: pkill -f \"node|react-scripts|python.*runserver\"" 