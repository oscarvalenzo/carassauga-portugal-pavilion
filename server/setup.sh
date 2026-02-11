#!/bin/bash

# Carassauga Backend Setup Script

echo "🚀 Setting up Carassauga Backend..."
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cat > .env << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=4000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-please-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-also-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database (using SQLite - no configuration needed!)
# SQLite database will be created automatically at: data/carassauga.db
EOF
  echo "✅ .env file created"
else
  echo "⚠️  .env file already exists, skipping..."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. npm run dev    # Start the development server"
echo "2. Test API: curl http://localhost:4000/health"
echo ""

