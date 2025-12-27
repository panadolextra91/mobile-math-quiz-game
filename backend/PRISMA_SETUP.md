# Prisma + PostgreSQL Setup Guide

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Node.js and npm installed

### Setup Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start PostgreSQL with Docker**:
   ```bash
   docker-compose up -d
   ```

   This will:
   - Pull PostgreSQL 16 image
   - Create a container named `math_maze_db`
   - Start PostgreSQL on port 5432
   - Create database `math_maze` with user `math_maze`

3. **Configure environment variables**:
   ```bash
   cp env.example .env
   ```

   The `.env` file already has the correct `DATABASE_URL` for Docker setup:
   ```
   DATABASE_URL="postgresql://math_maze:math_maze_password@localhost:5432/math_maze?schema=public"
   ```

4. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**:
   ```bash
   npm run prisma:migrate
   ```

   This will:
   - Create all database tables
   - Set up relationships
   - Create indexes

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## Docker Commands

- **Start database**: `docker-compose up -d`
- **Stop database**: `docker-compose down`
- **View logs**: `docker-compose logs -f postgres`
- **Restart database**: `docker-compose restart postgres`
- **Remove database and data** (⚠️ deletes all data): `docker-compose down -v`

## Manual PostgreSQL Setup (Alternative)

If you prefer to install PostgreSQL locally:

1. **Install PostgreSQL**:
   - macOS: `brew install postgresql@16`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`
   - Windows: Download from https://www.postgresql.org/download/

2. **Start PostgreSQL service**:
   - macOS: `brew services start postgresql@16`
   - Linux: `sudo systemctl start postgresql`
   - Windows: Start PostgreSQL service from Services

3. **Create database**:
   ```bash
   psql postgres
   CREATE DATABASE math_maze;
   CREATE USER math_maze WITH PASSWORD 'math_maze_password';
   GRANT ALL PRIVILEGES ON DATABASE math_maze TO math_maze;
   \q
   ```

4. **Update `.env`** with your local PostgreSQL connection string if different from Docker setup.

## Useful Commands

- **Generate Prisma Client**: `npm run prisma:generate`
- **Create migration**: `npm run prisma:migrate`
- **Open Prisma Studio** (database GUI): `npm run prisma:studio`
- **Reset database** (⚠️ deletes all data): `npx prisma migrate reset`

## Database Schema

The database includes:
- **game_sessions**: Active and completed game sessions
- **leaderboard_entries**: Leaderboard records
- **player_stats**: Player statistics
- **achievements**: Player achievements
- **quiz_type_stats**: Statistics per quiz type
- **difficulty_stats**: Statistics per difficulty level

## Troubleshooting

### Docker Connection Error
- Verify Docker is running: `docker ps`
- Check container is running: `docker-compose ps`
- View container logs: `docker-compose logs postgres`
- Restart container: `docker-compose restart postgres`

### Connection Error (Local PostgreSQL)
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env` matches your PostgreSQL setup
- Ensure database exists: `psql -l` should list `math_maze`

### Migration Errors
- Reset database: `npx prisma migrate reset`
- Check Prisma schema syntax: `npx prisma validate`
- For Docker: `docker-compose down -v && docker-compose up -d` then `npm run prisma:migrate`

### Prisma Client Not Found
- Run: `npm run prisma:generate`
