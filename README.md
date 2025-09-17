# 💰 Budget Compass - Monthly Money Manager

A comprehensive, production-ready web application for personal finance management built with modern technologies. Track expenses, manage budgets, and gain insights into your spending patterns with a beautiful, responsive interface.

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

- **📊 Expense Tracking**: Log expenses by category with amount, date, and notes
- **💰 Budget Management**: Set monthly budgets per category with visual progress tracking
- **📈 Dashboard**: Real-time overview of spending vs budgets with charts and insights
- **🔔 Smart Alerts**: Get notified when reaching 80% of category budget (once per month)
- **📧 Weekly Digests**: Automated email summaries of spending patterns
- **🌍 Timezone Support**: Configurable timezone (default: America/Halifax)
- **💱 Multi-Currency**: Support for CAD, USD, EUR, GBP, JPY, AUD (default: CAD)
- **🔒 Secure**: Row Level Security (RLS) ensures data isolation
- **📱 Responsive**: Beautiful, accessible UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React icons
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Validation**: Zod schemas with React Hook Form
- **Date Handling**: date-fns with timezone support
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS with CSS variables

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Git (for cloning)

### 1. Clone Repository

```bash
git clone https://github.com/hpkushal/Budget-Compass.git
cd Budget-Compass
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup

Run the database setup scripts in your Supabase SQL Editor:

```bash
# Core schema and tables
supabase/schema.sql

# Row Level Security policies
supabase/rls_policies.sql

# Database triggers and functions
supabase/triggers_functions.sql

# Views for optimized queries
supabase/views.sql

# Sample data (optional)
supabase/seed_data.sql
```

Or use the quick fix script:
```bash
# If you encounter signup issues
fix-auth-trigger.sql
```

### 4. Install Dependencies

```bash
npm install
# or
yarn install
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── globals.css        # Global styles & CSS variables
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── signup/        # Signup page
│   │   └── callback/      # Auth callback handler
│   ├── dashboard/         # Main dashboard
│   ├── expenses/          # Expense management
│   │   └── new/           # Add expense form
│   ├── budgets/           # Budget management
│   ├── reports/           # Financial reports
│   ├── analytics/         # Analytics dashboard
│   └── settings/          # User settings
├── components/
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── expenses/          # Expense-related components
│   ├── budgets/           # Budget components
│   ├── reports/           # Report components
│   ├── settings/          # Settings components
│   ├── providers/         # React context providers
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client configurations
│   ├── currency.ts        # Currency utilities
│   ├── date-utils.ts      # Date/timezone utilities
│   ├── excel-export.ts    # Excel export functionality
│   ├── user-setup.ts      # User onboarding utilities
│   ├── validations.ts     # Zod schemas
│   └── utils.ts           # General utilities
└── types/
    └── database.ts        # TypeScript database types

supabase/                   # Database setup scripts
├── schema.sql             # Core database schema
├── rls_policies.sql       # Row Level Security policies
├── triggers_functions.sql # Database triggers & functions
├── views.sql              # Optimized database views
└── seed_data.sql          # Sample data for development
```

## 🗄️ Database Schema

### Core Tables

- **user_settings**: User preferences (timezone, currency, digest settings)
- **categories**: Expense categories with colors and icons
- **expenses**: Individual expense records
- **budgets**: Monthly budget allocations per category
- **budget_alerts**: 80% budget warning system
- **weekly_digest_queue**: Email digest scheduling

### Key Features

- **Auto User Setup**: Default categories and settings created on signup
- **Budget Alerts**: Automatic triggers when expenses reach 80% of budget
- **Timezone Handling**: All dates stored in UTC, displayed in user timezone
- **Multi-Currency**: Support for 6 major currencies
- **Optimized Queries**: Pre-computed views for dashboard performance

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## ✅ Current Features

The application is **production-ready** with the following features:

### 🔐 Authentication System
- ✅ User signup and login with Supabase Auth
- ✅ Email confirmation support
- ✅ Protected routes with middleware
- ✅ Automatic user setup with default categories

### 📊 Dashboard
- ✅ Real-time financial overview
- ✅ Budget vs spending visualization
- ✅ Monthly expense trends
- ✅ Category-wise spending breakdown
- ✅ Financial highlights and insights

### 💰 Expense Management
- ✅ Add expenses with categories, amounts, and notes
- ✅ View expense history with filtering
- ✅ Category-based expense tracking
- ✅ Excel export functionality

### 📈 Budget Management  
- ✅ Set monthly budgets per category
- ✅ Visual progress tracking with color-coded bars
- ✅ Budget alerts at 80% threshold
- ✅ Automatic budget rollover

### 🔧 Settings & Customization
- ✅ User preferences (timezone, currency)
- ✅ Category management (add, edit, delete)
- ✅ Notification settings
- ✅ Multi-currency support (CAD, USD, EUR, GBP, JPY, AUD)

### 📊 Analytics & Reports
- ✅ Monthly spending reports
- ✅ Category-wise analytics
- ✅ Export to Excel functionality
- ✅ Visual charts and graphs

## 🚀 Future Enhancements

Potential features for future versions:

1. **Email Notifications** - Weekly digest and budget alerts
2. **Mobile App** - React Native companion app
3. **Advanced Analytics** - Spending predictions and trends
4. **Receipt Scanning** - OCR for automatic expense entry
5. **Multi-Account Support** - Bank account integration
6. **Shared Budgets** - Family/household budget management

## 🔐 Authentication Setup

To complete the authentication setup:

1. **Configure Supabase Auth**:
   - Go to Supabase Dashboard → Authentication → Settings
   - Set Site URL: `http://localhost:3000`
   - Add redirect URLs for production

2. **Email Templates** (optional):
   - Customize signup confirmation email
   - Set up password reset template

## 📧 Email Setup

For production email features:

1. **Get Resend API Key**: Sign up at [resend.com](https://resend.com)
2. **Add to environment**: `RESEND_API_KEY=your_key`
3. **Set FROM_EMAIL**: Your verified domain email

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables for Production

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
```

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Expense Management
![Expenses](https://via.placeholder.com/800x400?text=Expense+Management)

### Budget Tracking
![Budgets](https://via.placeholder.com/800x400?text=Budget+Tracking)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add proper error handling
- Update documentation for new features
- Ensure responsive design for all components

## 🐛 Bug Reports & Feature Requests

Please use GitHub Issues to report bugs or request features:

- **Bug Report**: Include steps to reproduce, expected vs actual behavior
- **Feature Request**: Describe the feature and its use case
- **Question**: For general questions about usage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.com/) - The open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icons

## 📞 Support

If you found this project helpful, please give it a ⭐️!

For support, email your-email@domain.com or join our Discord community.

---

**Built with ❤️ using Next.js 15, Supabase, and modern web technologies.**