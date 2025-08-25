# 🚀 Heritage100 CRM - Quick Start Guide

## 📋 Prerequisites Checklist

Before you begin, ensure you have:
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## ⚡ 5-Minute Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd heritage100-crm
npm install
```

### 2. Database Setup
```bash
# Create database
createdb heritage100_crm

# Set up environment
cp .env.example .env.local
```

### 3. Configure Environment
Edit `.env.local`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/heritage100_crm"
JWT_SECRET="your-secret-key"
```

### 4. Initialize Database
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Start Development
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server:dev
```

### 6. Access Application
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3001
- **Database Studio**: `npm run db:studio`

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@heritage100.com | admin123 |
| Agent | sarah.johnson@heritage100.com | agent123 |
| Manager | manager@heritage100.com | manager123 |

## 🎯 What You Can Do Now

### ✅ Working Features:
1. **Dashboard Overview** - View KPIs and recent activity
2. **Client Management** - Add, edit, view, and filter clients
3. **Property Portfolio** - Manage properties and track construction
4. **Analytics** - View performance metrics and trends
5. **Authentication** - Role-based access control

### 📱 Navigation:
- **Dashboard** - Main overview with stats and recent activity
- **Leads & Clients** - Complete client management system
- **Properties** - Property portfolio with construction tracking
- **Analytics** - Performance metrics and reporting

## 🛠️ Development Commands

```bash
# Frontend Development
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server

# Backend Development
npm run server:dev       # Start Express dev server
npm run server:build     # Build backend
npm run server:start     # Start production backend

# Database Operations
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed sample data
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm test                 # Run tests
```

## 📁 Project Structure

```
heritage100-crm/
├── app/                 # Next.js App Router
│   ├── (dashboard)/     # Dashboard routes
│   ├── api/            # API routes (Next.js)
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/            # Base UI components
│   └── dashboard/     # Dashboard components
├── lib/               # Utilities and configurations
├── server/            # Express.js backend
│   ├── routes/        # API routes
│   └── middleware/    # Express middleware
├── prisma/            # Database schema and migrations
├── types/             # TypeScript definitions
└── public/            # Static assets
```

## 🔧 Common Tasks

### Adding a New Client
1. Go to "Leads & Clients" page
2. Click "Add Client" button
3. Fill in client information
4. Client automatically starts in "LEAD" stage

### Viewing Analytics
1. Navigate to "Analytics" page
2. Use date range selector for different periods
3. View performance metrics and trends
4. Export reports using "Export Report" button

### Managing Properties
1. Go to "Properties" page
2. View property cards with construction progress
3. Filter by type, status, or search
4. Click "View" or "Edit" for property details

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_ctl status

# Verify database exists
psql -l | grep heritage100_crm

# Reset database
npm run db:push --force-reset
npm run db:seed
```

### Port Conflicts
- Frontend (3000): Change in `next.config.js`
- Backend (3001): Change `PORT` in `.env.local`

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check
```

## 📚 Next Steps

1. **Explore the Code**: Check out the well-organized codebase
2. **Add Features**: Implement remaining dashboard sections
3. **Customize**: Modify styling and branding
4. **Integrate**: Add external APIs (Gmail, WhatsApp, etc.)
5. **Test**: Add comprehensive test coverage
6. **Deploy**: Set up production deployment

## 🆘 Getting Help

- **Documentation**: Check README.md for detailed information
- **Project Status**: See PROJECT_STATUS.md for current progress
- **Code Comments**: Inline documentation throughout codebase
- **TypeScript**: Strong typing for better development experience

## 🎉 You're Ready!

The Heritage100 CRM is now running locally with:
- ✅ Complete database with sample data
- ✅ Working authentication system
- ✅ Functional dashboard with multiple sections
- ✅ Modern, responsive UI
- ✅ Professional development setup

Start exploring the dashboard and building amazing real estate CRM features! 🏢
