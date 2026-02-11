#!/bin/bash

###############################################################################
# Deploy Supabase Self-hosted for Government Use
# نشر Supabase على سيرفر خاص للجهات الحكومية
###############################################################################

set -e  # Exit on error

echo "=========================================="
echo "🚀 Deploying Supabase Self-hosted"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   echo "   Please run: sudo ./deploy-self-hosted.sh"
   exit 1
fi

# Step 1: System Update
echo -e "${YELLOW}📦 Step 1: Updating system...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}"
echo ""

# Step 2: Install Docker
echo -e "${YELLOW}🐳 Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi
echo ""

# Step 3: Install Docker Compose
echo -e "${YELLOW}🔧 Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose-plugin -y
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi
echo ""

# Step 4: Clone Supabase
echo -e "${YELLOW}📥 Step 4: Downloading Supabase...${NC}"
if [ ! -d "supabase" ]; then
    git clone --depth 1 https://github.com/supabase/supabase
    echo -e "${GREEN}✅ Supabase downloaded${NC}"
else
    echo -e "${GREEN}✅ Supabase directory already exists${NC}"
fi
echo ""

# Step 5: Setup Environment
echo -e "${YELLOW}⚙️  Step 5: Setting up environment...${NC}"
cd supabase/docker

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your settings${NC}"
    echo -e "${YELLOW}   Run: node ../../scripts/generate-jwt-keys.js${NC}"
    echo -e "${YELLOW}   Then update .env with generated keys${NC}"
    echo ""
    read -p "Press enter when you've updated .env file..."
fi

echo -e "${GREEN}✅ Environment configured${NC}"
echo ""

# Step 6: Start Supabase
echo -e "${YELLOW}🚀 Step 6: Starting Supabase services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Check if services are running
echo -e "${YELLOW}🔍 Checking services status...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Supabase Self-hosted deployed successfully!"
echo "==========================================${NC}"
echo ""
echo "📍 Service URLs:"
echo "   - Supabase Studio: http://$(hostname -I | awk '{print $1}'):3000"
echo "   - REST API: http://$(hostname -I | awk '{print $1}'):8000"
echo "   - PostgreSQL: $(hostname -I | awk '{print $1}'):5432"
echo ""
echo "🔐 Security Reminders:"
echo "   1. Change default passwords in .env"
echo "   2. Set up firewall (ufw)"
echo "   3. Configure SSL/TLS with Nginx + Certbot"
echo "   4. Set up automated backups"
echo ""
echo "📚 Next Steps:"
echo "   1. Import your database schema:"
echo "      psql -h localhost -U postgres -f /path/to/schema.sql"
echo ""
echo "   2. Update your frontend .env:"
echo "      VITE_SUPABASE_URL=http://your-server-ip:8000"
echo "      VITE_SUPABASE_ANON_KEY=your-anon-key"
echo ""
echo "   3. Setup Nginx reverse proxy for production"
echo ""
echo "🔒 For production use, please:"
echo "   - Enable firewall"
echo "   - Use HTTPS/SSL"
echo "   - Set strong passwords"
echo "   - Configure backup strategy"
echo ""
