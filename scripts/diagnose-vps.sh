#!/bin/bash

# =============================================================================
# VPS Supabase Diagnostics Script
# سكريبت تشخيص مشاكل Supabase على VPS
# =============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  Supabase VPS Diagnostics${NC}"
echo -e "${BLUE}  تشخيص مشاكل Supabase على VPS${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""

# Track issues
ISSUES_FOUND=0

# =============================================================================
# 1. Check Docker Installation
# =============================================================================
echo -e "${YELLOW}[1/10] Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "  ${GREEN}✓ Docker installed: $DOCKER_VERSION${NC}"
else
    echo -e "  ${RED}✗ Docker NOT installed${NC}"
    echo -e "  ${YELLOW}Install: curl -fsSL https://get.docker.com | sh${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# =============================================================================
# 2. Check Docker Compose
# =============================================================================
echo -e "${YELLOW}[2/10] Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "  ${GREEN}✓ Docker Compose installed: $COMPOSE_VERSION${NC}"
else
    echo -e "  ${RED}✗ Docker Compose NOT installed${NC}"
    echo -e "  ${YELLOW}Install: apt install docker-compose${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# =============================================================================
# 3. Find Supabase Directory
# =============================================================================
echo -e "${YELLOW}[3/10] Looking for Supabase installation...${NC}"

SUPABASE_PATHS=(
    "/root/supabase/docker"
    "/home/supabase/docker"
    "/opt/supabase/docker"
    "$HOME/supabase/docker"
)

SUPABASE_DIR=""
for path in "${SUPABASE_PATHS[@]}"; do
    if [ -d "$path" ]; then
        SUPABASE_DIR="$path"
        echo -e "  ${GREEN}✓ Found Supabase at: $SUPABASE_DIR${NC}"
        break
    fi
done

if [ -z "$SUPABASE_DIR" ]; then
    echo -e "  ${RED}✗ Supabase directory not found${NC}"
    echo -e "  ${YELLOW}Install Supabase first${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    echo ""
    echo -e "${RED}Cannot continue without Supabase installation${NC}"
    exit 1
fi
echo ""

# Change to Supabase directory
cd "$SUPABASE_DIR"

# =============================================================================
# 4. Check Docker Compose File
# =============================================================================
echo -e "${YELLOW}[4/10] Checking docker-compose.yml...${NC}"
if [ -f "docker-compose.yml" ]; then
    echo -e "  ${GREEN}✓ docker-compose.yml exists${NC}"
else
    echo -e "  ${RED}✗ docker-compose.yml not found${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# =============================================================================
# 5. Check Environment File
# =============================================================================
echo -e "${YELLOW}[5/10] Checking .env file...${NC}"
if [ -f ".env" ]; then
    echo -e "  ${GREEN}✓ .env file exists${NC}"

    # Extract important variables
    ANON_KEY=$(grep "ANON_KEY=" .env | cut -d '=' -f2 | head -n 1)
    SERVICE_KEY=$(grep "SERVICE_ROLE_KEY=" .env | cut -d '=' -f2 | head -n 1)
    POSTGRES_PASSWORD=$(grep "POSTGRES_PASSWORD=" .env | cut -d '=' -f2 | head -n 1)

    if [ -n "$ANON_KEY" ]; then
        echo -e "  ${GREEN}✓ ANON_KEY found${NC}"
        echo -e "  ${BLUE}    First 20 chars: ${ANON_KEY:0:20}...${NC}"
    else
        echo -e "  ${RED}✗ ANON_KEY not found${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi

    if [ -n "$POSTGRES_PASSWORD" ]; then
        echo -e "  ${GREEN}✓ POSTGRES_PASSWORD set${NC}"
    else
        echo -e "  ${RED}✗ POSTGRES_PASSWORD not set${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "  ${RED}✗ .env file not found${NC}"
    echo -e "  ${YELLOW}Copy from .env.example: cp .env.example .env${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# =============================================================================
# 6. Check Supabase Containers Status
# =============================================================================
echo -e "${YELLOW}[6/10] Checking Supabase containers...${NC}"

REQUIRED_CONTAINERS=(
    "db"
    "kong"
    "auth"
    "rest"
    "storage"
    "meta"
)

RUNNING_COUNT=0
for container in "${REQUIRED_CONTAINERS[@]}"; do
    if docker-compose ps | grep "$container" | grep -q "Up"; then
        echo -e "  ${GREEN}✓ $container is running${NC}"
        RUNNING_COUNT=$((RUNNING_COUNT + 1))
    else
        echo -e "  ${RED}✗ $container is NOT running${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
done

if [ $RUNNING_COUNT -eq 0 ]; then
    echo ""
    echo -e "  ${RED}⚠ No containers running!${NC}"
    echo -e "  ${YELLOW}Start Supabase: docker-compose up -d${NC}"
fi
echo ""

# =============================================================================
# 7. Test Supabase API (Local)
# =============================================================================
echo -e "${YELLOW}[7/10] Testing Supabase API (localhost)...${NC}"

API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/rest/v1/ 2>/dev/null)

if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "404" ]; then
    echo -e "  ${GREEN}✓ API responding locally (HTTP $API_RESPONSE)${NC}"
else
    echo -e "  ${RED}✗ API not responding (HTTP $API_RESPONSE)${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# =============================================================================
# 8. Check Server IP
# =============================================================================
echo -e "${YELLOW}[8/10] Detecting server IP...${NC}"

SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}')

if [ -n "$SERVER_IP" ]; then
    echo -e "  ${GREEN}✓ Server IP: $SERVER_IP${NC}"

    # Test external access
    echo -e "  ${BLUE}Testing external access...${NC}"
    EXTERNAL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:8000/rest/v1/ 2>/dev/null)

    if [ "$EXTERNAL_RESPONSE" = "200" ] || [ "$EXTERNAL_RESPONSE" = "404" ]; then
        echo -e "  ${GREEN}✓ API accessible externally (HTTP $EXTERNAL_RESPONSE)${NC}"
    else
        echo -e "  ${RED}✗ API not accessible externally${NC}"
        echo -e "  ${YELLOW}Check firewall: ufw allow 8000/tcp${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "  ${YELLOW}⚠ Could not detect server IP${NC}"
fi
echo ""

# =============================================================================
# 9. Check Firewall
# =============================================================================
echo -e "${YELLOW}[9/10] Checking firewall...${NC}"

if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status 2>/dev/null)

    if echo "$UFW_STATUS" | grep -q "Status: active"; then
        echo -e "  ${GREEN}✓ UFW is active${NC}"

        if echo "$UFW_STATUS" | grep -q "8000"; then
            echo -e "  ${GREEN}✓ Port 8000 is open${NC}"
        else
            echo -e "  ${RED}✗ Port 8000 is NOT open${NC}"
            echo -e "  ${YELLOW}Open it: ufw allow 8000/tcp && ufw reload${NC}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    else
        echo -e "  ${YELLOW}⚠ UFW is not active${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠ UFW not installed${NC}"
fi
echo ""

# =============================================================================
# 10. Check Open Ports
# =============================================================================
echo -e "${YELLOW}[10/10] Checking open ports...${NC}"

if command -v netstat &> /dev/null; then
    if netstat -tlnp 2>/dev/null | grep -q ":8000"; then
        echo -e "  ${GREEN}✓ Port 8000 is listening${NC}"
        netstat -tlnp 2>/dev/null | grep ":8000"
    else
        echo -e "  ${RED}✗ Port 8000 is NOT listening${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
elif command -v ss &> /dev/null; then
    if ss -tlnp 2>/dev/null | grep -q ":8000"; then
        echo -e "  ${GREEN}✓ Port 8000 is listening${NC}"
        ss -tlnp 2>/dev/null | grep ":8000"
    else
        echo -e "  ${RED}✗ Port 8000 is NOT listening${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "  ${YELLOW}⚠ netstat/ss not available${NC}"
fi
echo ""

# =============================================================================
# Summary
# =============================================================================
echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  Diagnosis Summary${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ No issues found! Supabase is working correctly.${NC}"
    echo ""
    echo -e "${BLUE}Your Supabase Configuration:${NC}"
    echo -e "  ${GREEN}Supabase URL:${NC} http://$SERVER_IP:8000"
    echo -e "  ${GREEN}ANON_KEY:${NC} ${ANON_KEY:0:30}..."
    echo ""
    echo -e "${BLUE}Use these in your application .env:${NC}"
    echo ""
    echo -e "  ${YELLOW}VITE_SUPABASE_URL=http://$SERVER_IP:8000${NC}"
    echo -e "  ${YELLOW}VITE_SUPABASE_ANON_KEY=$ANON_KEY${NC}"
    echo ""
else
    echo -e "${RED}✗ Found $ISSUES_FOUND issue(s)${NC}"
    echo ""
    echo -e "${BLUE}Quick fixes:${NC}"
    echo ""

    if ! docker-compose ps | grep -q "Up"; then
        echo -e "  ${YELLOW}1. Start Supabase:${NC}"
        echo -e "     cd $SUPABASE_DIR"
        echo -e "     docker-compose up -d"
        echo ""
    fi

    if ! ufw status 2>/dev/null | grep -q "8000"; then
        echo -e "  ${YELLOW}2. Open firewall port:${NC}"
        echo -e "     ufw allow 8000/tcp"
        echo -e "     ufw reload"
        echo ""
    fi

    echo -e "  ${YELLOW}3. Rebuild your application:${NC}"
    echo -e "     cd /path/to/your/app"
    echo -e "     npm run build"
    echo ""
fi

echo -e "${BLUE}======================================================${NC}"
echo ""

# =============================================================================
# Generate fix script
# =============================================================================
if [ $ISSUES_FOUND -gt 0 ]; then
    echo -e "${YELLOW}Creating auto-fix script...${NC}"

    cat > fix-supabase.sh << 'FIX_EOF'
#!/bin/bash

echo "Applying fixes..."

# Start Supabase
cd SUPABASE_DIR_PLACEHOLDER
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Open firewall
if command -v ufw &> /dev/null; then
    ufw allow 8000/tcp
    ufw reload
fi

echo "Fixes applied! Run diagnostics again:"
echo "./diagnose-vps.sh"
FIX_EOF

    sed -i "s|SUPABASE_DIR_PLACEHOLDER|$SUPABASE_DIR|g" fix-supabase.sh
    chmod +x fix-supabase.sh

    echo -e "${GREEN}✓ Auto-fix script created: fix-supabase.sh${NC}"
    echo -e "  Run it with: ${YELLOW}./fix-supabase.sh${NC}"
    echo ""
fi

exit $ISSUES_FOUND
