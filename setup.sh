#!/bin/bash

# qBittorrent MCP Server Quick Start

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "To start the server, run:"
echo "  npm start"
echo ""
echo "To use in Claude, add this to your Claude config:"
echo ""
cat << 'EOF'
{
  "mcpServers": {
    "qbit-mcp": {
      "command": "node",
      "args": ["/path/to/qbit-mcp/dist/index.js"],
      "env": {
        "QBIT_URL": "http://localhost:8080",
        "QBIT_USERNAME": "admin",
        "QBIT_PASSWORD": "adminPassword"
      }
    }
  }
}
EOF
echo ""
echo "Make sure to update the path and credentials!"
