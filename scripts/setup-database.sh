#!/bin/bash

# Monthly Money Manager - Database Setup Script
# This script sets up the complete Supabase database schema

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database connection string
DB_URL="postgresql://postgres.fiswiqyybmoycrsykrxw:[Halifax&95]@aws-1-ca-central-1.pooler.supabase.com:6543/postgres"

echo -e "${BLUE}🚀 Monthly Money Manager - Database Setup${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql is not installed or not in PATH${NC}"
    echo -e "${YELLOW}💡 Please install PostgreSQL client tools or use Supabase SQL Editor${NC}"
    echo -e "${YELLOW}   macOS: brew install postgresql${NC}"
    echo -e "${YELLOW}   Ubuntu: sudo apt-get install postgresql-client${NC}"
    exit 1
fi

# Check if supabase directory exists
if [ ! -d "supabase" ]; then
    echo -e "${RED}❌ Error: supabase directory not found${NC}"
    echo -e "${YELLOW}💡 Please run this script from the project root directory${NC}"
    exit 1
fi

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo -e "${BLUE}📄 Running: ${description}${NC}"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Error: File $file not found${NC}"
        exit 1
    fi
    
    if psql "$DB_URL" -f "$file" -q; then
        echo -e "${GREEN}✅ Success: ${description}${NC}"
    else
        echo -e "${RED}❌ Failed: ${description}${NC}"
        echo -e "${YELLOW}💡 Check the error above and fix before continuing${NC}"
        exit 1
    fi
    echo ""
}

# Test database connection
echo -e "${BLUE}🔗 Testing database connection...${NC}"
if psql "$DB_URL" -c "SELECT version();" -q > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Failed to connect to database${NC}"
    echo -e "${YELLOW}💡 Please check your connection string and network access${NC}"
    exit 1
fi
echo ""

# Run SQL files in order
echo -e "${BLUE}📊 Setting up database schema...${NC}"
echo ""

run_sql_file "supabase/schema.sql" "Core Schema (tables, types, indexes)"
run_sql_file "supabase/rls_policies.sql" "Row Level Security Policies"
run_sql_file "supabase/triggers_functions.sql" "Triggers and Functions"
run_sql_file "supabase/views.sql" "Database Views"

echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
echo ""

# Ask about seed data
echo -e "${YELLOW}📝 Would you like to load seed data for testing? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}📊 Loading seed data...${NC}"
    
    # Get available users
    echo -e "${BLUE}👥 Available users in your database:${NC}"
    psql "$DB_URL" -c "SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;" -q
    echo ""
    
    echo -e "${YELLOW}👤 Enter a user ID to load seed data for (or press Enter to skip):${NC}"
    read -r user_id
    
    if [ -n "$user_id" ]; then
        echo -e "${BLUE}📊 Loading seed data for user: ${user_id}${NC}"
        result=$(psql "$DB_URL" -t -c "SELECT insert_seed_data('$user_id');" 2>/dev/null || echo "Error occurred")
        
        if [[ "$result" == *"Successfully"* ]]; then
            echo -e "${GREEN}✅ Seed data loaded successfully${NC}"
        else
            echo -e "${RED}❌ Failed to load seed data: $result${NC}"
            echo -e "${YELLOW}💡 Make sure the user ID exists in auth.users table${NC}"
        fi
    else
        echo -e "${YELLOW}⏭️  Skipping seed data${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipping seed data${NC}"
fi

echo ""
echo -e "${GREEN}🏁 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 What's been set up:${NC}"
echo -e "   • Core database schema with all tables"
echo -e "   • Row Level Security policies"
echo -e "   • Automatic triggers for user setup and budget alerts"
echo -e "   • Optimized views for dashboard queries"
echo -e "   • Utility functions for common operations"
echo ""
echo -e "${BLUE}🔗 Next steps:${NC}"
echo -e "   • Test your setup with the verification queries in supabase/README.md"
echo -e "   • Set up Supabase Auth configuration"
echo -e "   • Initialize your Next.js application"
echo ""
echo -e "${BLUE}🧪 Quick test:${NC}"
echo -e "${YELLOW}   psql \"postgresql://postgres.fiswiqyybmoycrsykrxw:[Halifax&95]@aws-1-ca-central-1.pooler.supabase.com:6543/postgres\" -c \"SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;\"${NC}"
echo ""
