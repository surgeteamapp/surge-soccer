# ⚽ Power Soccer Team Management Platform

A comprehensive team management platform designed specifically for power soccer teams, providing tools for coaching, training, communication, and team coordination.

## 🌟 Features

### 👥 User Management
- **Role-Based Access Control**: Support for Admins, Coaches, Players, Equipment Managers, and Family members
- **Authentication**: Secure login with NextAuth.js (Google OAuth + Credentials)
- **User Profiles**: Customizable profiles with avatars and player information

### 📚 Interactive Playbook Manager
- **Visual Play Designer**: Create and edit plays with drag-and-drop interface
- **Playbook Organization**: Group plays into organized playbooks
- **Play Complexity Levels**: Categorize plays by difficulty (Beginner, Intermediate, Advanced)
- **Formation Builder**: Design player positions and movement patterns

### 📝 Training & Progress Tracking
- **Task Assignment**: Coaches can assign training tasks to players
- **Progress Monitoring**: Track completion percentage and task status
- **Linked Resources**: Connect tasks to specific plays or training videos
- **Performance Analytics**: View player strengths and areas for improvement
- **Progress Dashboard**: Comprehensive overview of team and individual progress

### 💬 Real-Time Communication
- **Team Chat**: Socket.IO-powered real-time messaging
- **Direct Messages**: Private conversations between users
- **Typing Indicators**: See when others are typing
- **Message History**: Persistent chat history stored in database

### 📅 Schedule Management
- **Team Calendar**: View practices, games, and events
- **Event Types**: Differentiate between practices, games, meetings, and other events
- **Location Tracking**: Store venue information for each event
- **Notifications**: Stay updated on upcoming events

### 🎥 Video Management
- **Video Library**: Store and organize training videos and game film
- **Categories**: Organize by Training, Game Film, Highlights, or Other
- **Video Integration**: Link videos to training tasks and plays
- **YouTube Support**: Embed and play YouTube videos directly

### 📊 Statistics & Analytics
- **Player Stats**: Track individual performance metrics
- **Team Analytics**: Overall team performance insights
- **Progress Trends**: Visualize improvement over time

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Real-Time**: [Socket.IO](https://socket.io/)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd surge-soccer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configuration (see [SETUP.md](./SETUP.md) for details)

4. **Initialize the database**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development servers**:
   ```bash
   npm run dev:all
   ```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Socket.IO Server**: http://localhost:4000

### Test Credentials (After Seeding)

- **Admin**: admin@surgesoccer.com / admin123
- **Coach**: coach.smith@surgesoccer.com / coach123
- **Player**: michael.stevens@surgesoccer.com / player123

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Test Results](./testing-results.md) - Testing documentation and findings
- [Test Plan](./test-plan.md) - Comprehensive testing strategy

## 📁 Project Structure

```
surge-soccer/
├── app/                      # Next.js App Router pages
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── training/        # Training module
│   │   ├── playbooks/       # Playbook management
│   │   ├── schedule/        # Calendar and events
│   │   ├── videos/          # Video library
│   │   └── stats/           # Statistics and analytics
│   ├── api/                 # API routes
│   │   └── auth/            # Authentication endpoints
│   └── (auth)/              # Authentication pages
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── training/            # Training-specific components
│   ├── playbooks/           # Playbook components
│   └── ...                  # Other feature components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
├── prisma/                  # Database schema and migrations
├── server/                  # Socket.IO server
└── public/                  # Static assets
```

## 🧪 Testing

Access the test pages at:
- **Component Tests**: http://localhost:3000/component-test
- **Hook Tests**: http://localhost:3000/hook-test
- **Test Navigation**: http://localhost:3000/tests

Run linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## 🗄️ Database

### Useful Commands

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Create a new migration
npm run db:migrate

# Push schema changes without migration
npm run db:push

# Seed the database with test data
npm run db:seed
```

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT-based authentication with NextAuth.js
- Environment variables for sensitive data
- CORS configuration for Socket.IO
- Role-based access control throughout the application

## 🚢 Deployment

For production deployment instructions, see [SETUP.md](./SETUP.md#production-deployment).

Recommended platforms:
- **Frontend**: Vercel, Netlify
- **Database**: Supabase, Railway, Neon
- **Socket.IO**: Railway, Render

## 📝 Scripts

- `npm run dev` - Start Next.js development server
- `npm run server` - Start Socket.IO server (production)
- `npm run server:dev` - Start Socket.IO server (development with auto-reload)
- `npm run dev:all` - Start both servers concurrently
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with test data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Project Surge** - Empowering Power Soccer Teams 🏆
