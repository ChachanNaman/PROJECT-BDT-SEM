#!/bin/bash
# Script to kill all processes using port 5000

echo "Finding processes using port 5000..."

# Kill all processes using port 5000
PIDS=$(lsof -ti:5000)

if [ -z "$PIDS" ]; then
  echo "✅ Port 5000 is already free!"
  exit 0
fi

echo "Found processes: $PIDS"
echo "Killing processes..."

# Kill each process
for PID in $PIDS; do
  echo "Killing process $PID..."
  kill -9 $PID 2>/dev/null
done

sleep 2

# Verify
REMAINING=$(lsof -ti:5000)
if [ -z "$REMAINING" ]; then
  echo "✅ Port 5000 is now free!"
else
  echo "⚠️  Some processes may still be running. Remaining PIDs: $REMAINING"
fi

