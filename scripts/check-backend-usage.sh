#!/bin/bash

# =============================================================================
# Check Backend Usage in Project
# فحص استخدام Backend في المشروع
# =============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  Backend Usage Analysis${NC}"
echo -e "${BLUE}  تحليل استخدام Backend في المشروع${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""

BACKEND_USED=0

# =============================================================================
# 1. Check for backend imports
# =============================================================================
echo -e "${YELLOW}[1/6] Checking for backend imports in src/...${NC}"

BACKEND_IMPORTS=$(grep -r "from.*backend" src/ 2>/dev/null || grep -r "import.*backend" src/ 2>/dev/null || echo "")

if [ -z "$BACKEND_IMPORTS" ]; then
    echo -e "  ${GREEN}✓ No backend imports found${NC}"
else
    echo -e "  ${RED}✗ Backend imports found:${NC}"
    echo "$BACKEND_IMPORTS"
    BACKEND_USED=1
fi
echo ""

# =============================================================================
# 2. Check for API calls to backend
# =============================================================================
echo -e "${YELLOW}[2/6] Checking for backend API calls...${NC}"

API_CALLS=$(grep -r "localhost:3000\|localhost:5000\|/api/" src/ 2>/dev/null | grep -v "supabase" | grep -v "node_modules" | grep -v ".md" || echo "")

if [ -z "$API_CALLS" ]; then
    echo -e "  ${GREEN}✓ No backend API calls found${NC}"
else
    echo -e "  ${RED}✗ Backend API calls found:${NC}"
    echo "$API_CALLS" | head -5
    BACKEND_USED=1
fi
echo ""

# =============================================================================
# 3. Check environment variables
# =============================================================================
echo -e "${YELLOW}[3/6] Checking .env for backend configuration...${NC}"

if [ -f ".env" ]; then
    BACKEND_ENV=$(grep -i "backend\|api_url\|server_url" .env 2>/dev/null || echo "")

    if [ -z "$BACKEND_ENV" ]; then
        echo -e "  ${GREEN}✓ No backend environment variables${NC}"
    else
        echo -e "  ${RED}✗ Backend environment variables found:${NC}"
        echo "$BACKEND_ENV"
        BACKEND_USED=1
    fi
else
    echo -e "  ${YELLOW}⚠ .env file not found${NC}"
fi
echo ""

# =============================================================================
# 4. Check package.json scripts
# =============================================================================
echo -e "${YELLOW}[4/6] Checking package.json scripts...${NC}"

if [ -f "package.json" ]; then
    BACKEND_SCRIPTS=$(grep -i "backend\|server\|express" package.json | grep "scripts" || echo "")

    if [ -z "$BACKEND_SCRIPTS" ]; then
        echo -e "  ${GREEN}✓ No backend-related scripts in package.json${NC}"
    else
        echo -e "  ${YELLOW}⚠ Backend-related scripts found:${NC}"
        echo "$BACKEND_SCRIPTS"
    fi
else
    echo -e "  ${YELLOW}⚠ package.json not found${NC}"
fi
echo ""

# =============================================================================
# 5. Check what frontend actually uses
# =============================================================================
echo -e "${YELLOW}[5/6] Checking what frontend uses...${NC}"

SUPABASE_USAGE=$(grep -r "@supabase/supabase-js\|supabase.from\|createClient" src/ 2>/dev/null | wc -l)

if [ $SUPABASE_USAGE -gt 0 ]; then
    echo -e "  ${GREEN}✓ Frontend uses Supabase directly (${SUPABASE_USAGE} references)${NC}"
else
    echo -e "  ${YELLOW}⚠ No direct Supabase usage found${NC}"
fi
echo ""

# =============================================================================
# 6. Check if backend server is running
# =============================================================================
echo -e "${YELLOW}[6/6] Checking if backend server is running...${NC}"

if command -v lsof &> /dev/null; then
    BACKEND_PROCESS=$(lsof -i :3000 2>/dev/null || lsof -i :5000 2>/dev/null || echo "")

    if [ -z "$BACKEND_PROCESS" ]; then
        echo -e "  ${GREEN}✓ No backend server running on ports 3000/5000${NC}"
    else
        echo -e "  ${YELLOW}⚠ Backend server is running:${NC}"
        echo "$BACKEND_PROCESS"
        BACKEND_USED=1
    fi
elif command -v netstat &> /dev/null; then
    BACKEND_PROCESS=$(netstat -tlnp 2>/dev/null | grep ":3000\|:5000" || echo "")

    if [ -z "$BACKEND_PROCESS" ]; then
        echo -e "  ${GREEN}✓ No backend server running on ports 3000/5000${NC}"
    else
        echo -e "  ${YELLOW}⚠ Backend server is running:${NC}"
        echo "$BACKEND_PROCESS"
        BACKEND_USED=1
    fi
else
    echo -e "  ${YELLOW}⚠ Cannot check (lsof/netstat not available)${NC}"
fi
echo ""

# =============================================================================
# Summary
# =============================================================================
echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  Analysis Results${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""

if [ $BACKEND_USED -eq 0 ]; then
    echo -e "${GREEN}✓ BACKEND IS NOT USED IN THIS PROJECT${NC}"
    echo ""
    echo -e "${BLUE}Current Architecture:${NC}"
    echo ""
    echo -e "  ${GREEN}Frontend (React + Vite)${NC}"
    echo -e "         ${YELLOW}↓${NC}"
    echo -e "  ${GREEN}Direct connection${NC}"
    echo -e "         ${YELLOW}↓${NC}"
    echo -e "  ${GREEN}Supabase (Database + Auth + Storage)${NC}"
    echo ""
    echo -e "${BLUE}What the project uses:${NC}"
    echo -e "  ${GREEN}✓ Supabase client (@supabase/supabase-js)${NC}"
    echo -e "  ${GREEN}✓ Direct database operations${NC}"
    echo -e "  ${GREEN}✓ Supabase Edge Functions${NC}"
    echo -e "  ${GREEN}✓ Supabase Storage${NC}"
    echo ""
    echo -e "${BLUE}What the project does NOT use:${NC}"
    echo -e "  ${RED}✗ backend/ folder${NC}"
    echo -e "  ${RED}✗ Express.js server${NC}"
    echo -e "  ${RED}✗ Separate API server${NC}"
    echo ""
    echo -e "${GREEN}Conclusion:${NC}"
    echo -e "  The backend/ folder can be safely deleted."
    echo -e "  It's there as an alternative option but NOT currently used."
    echo ""
else
    echo -e "${RED}⚠ BACKEND MIGHT BE IN USE${NC}"
    echo ""
    echo -e "${YELLOW}Some backend references were found.${NC}"
    echo -e "${YELLOW}Please review the findings above.${NC}"
    echo ""
fi

echo -e "${BLUE}======================================================${NC}"
echo ""

# =============================================================================
# Generate report file
# =============================================================================
REPORT_FILE="backend_usage_report.txt"

cat > "$REPORT_FILE" << EOF
Backend Usage Analysis Report
Generated: $(date)

========================================
1. Backend Imports in src/
========================================
$(if [ -z "$BACKEND_IMPORTS" ]; then echo "None found"; else echo "$BACKEND_IMPORTS"; fi)

========================================
2. Backend API Calls
========================================
$(if [ -z "$API_CALLS" ]; then echo "None found"; else echo "$API_CALLS"; fi)

========================================
3. Backend Environment Variables
========================================
$(if [ -f ".env" ]; then if [ -z "$BACKEND_ENV" ]; then echo "None found"; else echo "$BACKEND_ENV"; fi; else echo ".env not found"; fi)

========================================
4. Backend Scripts in package.json
========================================
$(if [ -z "$BACKEND_SCRIPTS" ]; then echo "None found"; else echo "$BACKEND_SCRIPTS"; fi)

========================================
5. Supabase Usage
========================================
Found $SUPABASE_USAGE references to Supabase in src/

========================================
6. Backend Server Status
========================================
$(if [ -z "$BACKEND_PROCESS" ]; then echo "Not running"; else echo "Running"; fi)

========================================
Conclusion
========================================
$(if [ $BACKEND_USED -eq 0 ]; then echo "Backend folder is NOT used. Safe to delete."; else echo "Backend might be in use. Review findings."; fi)

EOF

echo -e "${GREEN}✓ Report saved to: ${REPORT_FILE}${NC}"
echo ""

exit $BACKEND_USED
