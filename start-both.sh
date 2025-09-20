#!/bin/bash

echo ""
echo "🚀 Starting Both N8n Mapping Engine Servers"
echo ""
echo "========================================"
echo "📊 Standalone Mapping Engine (Port 3000)"
echo "🎨 Lamatic.ai Integration Demo (Port 3001)"
echo "========================================"
echo ""

# Start the standalone mapping engine on port 3000
echo "Starting standalone mapping engine..."
gnome-terminal --title="Standalone Mapping Engine" -- bash -c "node server.js; exec bash" &

# Wait a moment
sleep 2

# Start the Lamatic.ai integration demo on port 3001
echo "Starting Lamatic.ai integration demo..."
gnome-terminal --title="Lamatic Integration Demo" -- bash -c "cd lamatic-integration && node demo-server.js; exec bash" &

# Wait a moment
sleep 3

# Open both in browser
echo ""
echo "🌐 Opening both demos in browser..."
xdg-open http://localhost:3000 &
xdg-open http://localhost:3001 &

echo ""
echo "✅ Both servers are now running!"
echo ""
echo "📊 Standalone: http://localhost:3000"
echo "🎨 Integration: http://localhost:3001"
echo ""
