# Power Soccer Team Management Platform - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git installed
- A Google Cloud Platform account (for OAuth)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd surge-soccer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Local PostgreSQL

1. **Install PostgreSQL** if you haven't already
2. **Create a database**:
   ```bash
   createdb surge_soccer
   ```
   Or using psql:
   ```sql
   CREATE DATABASE surge_soccer;
   ```

#### Option B: Cloud Database (e.g., Supabase, Neon)

1. Create an account on your preferred provider
2. Create a new PostgreSQL database
3. Copy the connection string

### 4. Environment Variables

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file** with your configuration:

#### Required Variables:

**DATABASE_URL**: Your PostgreSQL connection string
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**NEXTAUTH_SECRET**: Generate a secure random string
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**NEXTAUTH_URL**: Your application URL
```
NEXTAUTH_URL="http://localhost:3000"
```

**Google OAuth Credentials**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret

```
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

**Socket.IO Configuration**:
```
FRONTEND_URL="http://localhost:3000"
PORT="4000"
```

### 5. Initialize the Database

Run Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate the Prisma Client

### 6. Seed the Database (Optional)

Create sample data for development:

```bash
npx prisma db seed
```

### 7. Start the Development Servers

You need to run two servers:

**Terminal 1 - Next.js App**:
```bash
npm run dev
```

**Terminal 2 - Socket.IO Server**:
```bash
npm run server
```

Or run both concurrently:
```bash
npm run dev:all
```

The application will be available at:
- Frontend: http://localhost:3000
- Socket.IO: http://localhost:4000

## Development Workflow

### Database Management

**View database in Prisma Studio**:
```bash
npx prisma studio
```

**Create a new migration after schema changes**:
```bash
npx prisma migrate dev --name description_of_changes
```

**Reset database (WARNING: deletes all data)**:
```bash
npx prisma migrate reset
```

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Code Quality

**Lint the codebase**:
```bash
npm run lint
```

**Format code**:
```bash
npm run format
```

## Production Deployment

### 1. Environment Variables

Ensure all production environment variables are set:
- Use strong, unique `NEXTAUTH_SECRET`
- Update `NEXTAUTH_URL` to your production domain
- Use production database credentials
- Update `FRONTEND_URL` for Socket.IO

### 2. Build the Application

```bash
npm run build
```

### 3. Start Production Server

```bash
npm start
```

### 4. Database Migration

Run migrations in production:
```bash
npx prisma migrate deploy
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check connection string format
- Ensure database user has proper permissions

### NextAuth Errors

- Verify `NEXTAUTH_SECRET` is set
- Check Google OAuth credentials
- Ensure redirect URIs match your domain

### Socket.IO Connection Issues

- Verify Socket.IO server is running on port 4000
- Check CORS settings match your frontend URL
- Ensure firewall allows connections

### Build Errors

- Clear Next.js cache: `rm -rf .next`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Prisma client: `rm -rf node_modules/.prisma && npx prisma generate`

## Common Tasks

### Add a New User Manually

```bash
npx prisma studio
```
Then navigate to the User model and create a new record.

### Change User Role

```sql
UPDATE "User" SET role = 'COACH' WHERE email = 'user@example.com';
```

### View Application Logs

Development logs are output to the console. For production, consider using:
- Winston for structured logging
- Sentry for error tracking
- LogRocket for session replay

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Socket.IO Documentation](https://socket.io/docs/v4)

## Support

For issues or questions, please contact the development team or create an issue in the repository.
