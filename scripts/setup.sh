#!/bin/bash

# Casino Platform - Setup & Start Script
# This script helps you set up and start the infrastructure

set -e

echo "🎰 Casino Platform - Infrastructure Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Determine docker-compose command
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

cd "$(dirname "$0")"

echo -e "${GREEN}✅ Docker and Docker Compose are available${NC}"
echo ""

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services (PostgreSQL, Redis, RabbitMQ)"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  logs        Show logs from all services"
    echo "  clean       Stop and remove all containers and volumes"
    echo "  db-shell    Connect to PostgreSQL database"
    echo "  redis-cli   Connect to Redis CLI"
    echo "  help        Show this help message"
    echo ""
}

# Main command handler
case "${1:-start}" in
    start)
        echo -e "${YELLOW}🚀 Starting services...${NC}"
        $COMPOSE_CMD up -d
        
        echo ""
        echo -e "${GREEN}✅ Services started!${NC}"
        echo ""
        echo "Waiting for services to be ready..."
        
        # Wait for PostgreSQL
        echo -n "  📦 PostgreSQL"
        until $COMPOSE_CMD exec -T postgres pg_isready -U postgres -d casino_platform > /dev/null 2>&1; do
            echo -n "."
            sleep 1
        done
        echo -e "${GREEN} Ready${NC}"
        
        # Wait for Redis
        echo -n "  🔴 Redis"
        until $COMPOSE_CMD exec -T redis redis-cli ping > /dev/null 2>&1; do
            echo -n "."
            sleep 1
        done
        echo -e "${GREEN} Ready${NC}"
        
        # Wait for RabbitMQ
        echo -n "  🐰 RabbitMQ"
        until $COMPOSE_CMD exec -T rabbitmq rabbitmq-diagnostics -q ping > /dev/null 2>&1; do
            echo -n "."
            sleep 1
        done
        echo -e "${GREEN} Ready${NC}"
        
        echo ""
        echo -e "${GREEN}🎉 All services are ready!${NC}"
        echo ""
        echo "Service URLs:"
        echo "  📦 PostgreSQL:  localhost:5432"
        echo "     - Database: casino_platform"
        echo "     - User:     postgres"
        echo "     - Password: postgres"
        echo ""
        echo "  🔴 Redis:       localhost:6379"
        echo "     - No password (development)"
        echo ""
        echo "  🐰 RabbitMQ:    http://localhost:15672"
        echo "     - User:     guest"
        echo "     - Password: guest"
        echo ""
        echo "Next steps:"
        echo "  1. Copy .env.example to .env and configure"
        echo "  2. Run: npm install"
        echo "  3. Run: npm run dev"
        ;;
        
    stop)
        echo -e "${YELLOW}🛑 Stopping services...${NC}"
        $COMPOSE_CMD down
        echo -e "${GREEN}✅ Services stopped${NC}"
        ;;
        
    restart)
        echo -e "${YELLOW}🔄 Restarting services...${NC}"
        $COMPOSE_CMD restart
        echo -e "${GREEN}✅ Services restarted${NC}"
        ;;
        
    status)
        echo -e "${YELLOW}📊 Service Status:${NC}"
        $COMPOSE_CMD ps
        ;;
        
    logs)
        SERVICE="${2:-}"
        if [ -n "$SERVICE" ]; then
            $COMPOSE_CMD logs -f "$SERVICE"
        else
            $COMPOSE_CMD logs -f
        fi
        ;;
        
    clean)
        echo -e "${RED}⚠️  This will remove all containers and volumes!${NC}"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            $COMPOSE_CMD down -v
            echo -e "${GREEN}✅ Cleaned up all containers and volumes${NC}"
        else
            echo "Cancelled."
        fi
        ;;
        
    db-shell|psql)
        echo -e "${YELLOW}🔌 Connecting to PostgreSQL...${NC}"
        $COMPOSE_CMD exec postgres psql -U postgres -d casino_platform
        ;;
        
    redis-cli)
        echo -e "${YELLOW}🔌 Connecting to Redis...${NC}"
        $COMPOSE_CMD exec redis redis-cli
        ;;
        
    help|--help|-h)
        show_usage
        ;;
        
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
