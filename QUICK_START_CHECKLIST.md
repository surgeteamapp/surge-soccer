# Quick Start Checklist for Local Development

Follow these steps to get your Power Soccer Team Management Platform running locally with a real database.

## ✅ Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 14+ installed and running
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## 📝 Step 1: Environment Setup

### 1.1 Create Database

Open PostgreSQL command line (psql) or use a GUI tool like pgAdmin:

```sql
CREATE DATABASE surge_soccer;
```

Or using command line:
```bash
createdb surge_soccer
```

### 1.2 Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/surge_soccer?schema=public"

# NextAuth - Generate a random secret
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional for now - can use credentials login)
GOOGLE_CLIENT_ID="optional-for-testing"
GOOGLE_CLIENT_SECRET="optional-for-testing"

# Socket.IO
FRONTEND_URL="http://localhost:3000"
PORT="4000"
```

### 1.3 Generate NextAuth Secret

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**On Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output and paste it as your `NEXTAUTH_SECRET` in `.env`

## 📦 Step 2: Install Dependencies

```bash
npm install
```

## 🗄️ Step 3: Database Setup

### 3.1 Run Migrations

This will create all database tables:

```bash
npm run db:migrate
```

When prompted for a migration name, use: `init`

### 3.2 Seed the Database

This will create test users and sample data:

```bash
npm run db:seed
```

### 3.3 Verify Database (Optional)

Open Prisma Studio to see your data:

```bash
npm run db:studio
```

This opens a browser interface at http://localhost:5555

## 🚀 Step 4: Start Development Servers

### Option A: Run Both Servers Together (Recommended)

```bash
npm run dev:all
```

This starts:
- Next.js on http://localhost:3000
- Socket.IO on http://localhost:4000

### Option B: Run Separately

**Terminal 1 - Next.js:**
```bash
npm run dev
```

**Terminal 2 - Socket.IO:**
```bash
npm run server:dev
```

## 🧪 Step 5: Test the Application

### 5.1 Access the Application

Open your browser to: **http://localhost:3000**

### 5.2 Login with Test Credentials

**Admin:**
- Email: `admin@surgesoccer.com`
- Password: `admin123`

**Coach:**
- Email: `coach.smith@surgesoccer.com`
- Password: `coach123`

**Player:**
- Email: `michael.stevens@surgesoccer.com`
- Password: `player123`

### 5.3 Test the Training System

1. **Login** as a coach
2. Go to **Training** in the sidebar
3. View the **Progress Dashboard**
4. View **Task List**
5. Try to **Assign a new task**

### 5.4 Test API Endpoints

#### Using Browser Developer Tools:

Open DevTools Console (F12) and run:

```javascript
// Test GET tasks
fetch('/api/training/tasks')
  .then(r => r.json())
  .then(console.log);

// Test GET player progress
fetch('/api/training/progress')
  .then(r => r.json())
  .then(console.log);
```

#### Using curl:

```bash
# Test tasks endpoint
curl http://localhost:3000/api/training/tasks

# Test progress endpoint
curl http://localhost:3000/api/training/progress
```

#### Using Postman or Insomnia:

1. Create a new request
2. Method: `GET`
3. URL: `http://localhost:3000/api/training/tasks`
4. Send

## 🐛 Troubleshooting

### Database Connection Errors

**Error: "Connection refused"**
- Check if PostgreSQL is running: `pg_isready`
- Verify your `DATABASE_URL` in `.env`
- Make sure PostgreSQL is listening on port 5432

**Error: "Database does not exist"**
- Create the database: `createdb surge_soccer`

**Error: "Authentication failed"**
- Check your PostgreSQL username and password in `DATABASE_URL`

### NextAuth Errors

**Error: "[next-auth][error][CLIENT_FETCH_ERROR]"**
- Make sure `NEXTAUTH_SECRET` is set in `.env`
- Verify `NEXTAUTH_URL` matches your development URL

### Build Errors

**Error: "Cannot find module"**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf .next`

### Port Already in Use

**Error: "Port 3000 is already in use"**
- Kill the process: 
  - Windows: `npx kill-port 3000`
  - Mac/Linux: `lsof -ti:3000 | xargs kill`

## 📊 Verify Everything is Working

- [ ] Can login with test credentials
- [ ] Can see training tasks in the dashboard
- [ ] Can view player progress
- [ ] Browser console shows no errors
- [ ] API endpoints return data (use DevTools Network tab)
- [ ] Database has sample data (check Prisma Studio)

## 🎯 Next Steps After Setup

1. **Explore the Application**
   - Navigate through all pages
   - Test creating, viewing, and updating training tasks
   - Check player progress views

2. **Review the Code**
   - API routes in `/app/api/training/`
   - Updated `useTraining` hook in `/hooks/`
   - Training components in `/components/training/`

3. **Make Changes**
   - Try modifying a component
   - Add a new API endpoint
   - Update the database schema

4. **Test Your Changes**
   - Use the test pages at `/tests`
   - Check the browser console for errors
   - Use Prisma Studio to verify database changes

## 📚 Additional Resources

- **Setup Guide**: See `SETUP.md` for detailed instructions
- **API Documentation**: See `app/api/training/` for endpoint code
- **Implementation Progress**: See `IMPLEMENTATION_PROGRESS.md`
- **Session Summary**: See `SESSION_SUMMARY.md`

## 🆘 Need Help?

If you encounter issues not covered here:

1. Check the browser console for JavaScript errors
2. Check the terminal for server errors
3. Review the `SETUP.md` file for more detailed instructions
4. Check PostgreSQL logs for database errors

---

**Happy Coding! 🚀**
