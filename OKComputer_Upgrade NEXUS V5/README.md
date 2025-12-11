# NEXUS V5 - Operating System for Life Insurance Agents

A comprehensive, production-ready SaaS platform built for life insurance agents and agencies. NEXUS V5 provides end-to-end management of leads, agents, recruits, finances, and operations with AI-powered insights.

## 🚀 Features

### Core Operating Systems
- **Agent OS**: Daily workflow management with lead tracking, dial sessions, and performance analytics
- **Recruit OS**: Complete recruiting pipeline with Tylica integration and licensing workflow
- **Manager OS**: Team oversight with performance monitoring and training management
- **Finance OS (Pocket CFO)**: Personal and business financial management with tax calculations
- **Founder OS**: Multi-agency analytics and system controls
- **AI Intelligence Layer**: AI-powered mentor, drift alerts, and script optimization

### Key Capabilities
- Lead management and pipeline tracking
- Dial session management with call logging
- Recruit lifecycle management (NEW → LICENSED → ACTIVATED)
- Financial transaction tracking with ROI analysis
- Task and calendar management
- Internal messaging system
- Real-time performance analytics
- Drift detection and alerts
- AI-powered coaching and insights

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Recharts** for data visualization
- **React Hook Form** for form management
- **Zod** for validation

### Backend
- **Next.js API Routes** for server-side logic
- **Prisma ORM** for database operations
- **PostgreSQL** database
- **NextAuth.js** for authentication
- **bcryptjs** for password hashing

### Integrations (Environment Variables Required)
- **OpenAI API** for AI mentor and insights
- **Twilio** for SMS/phone integration
- **Gmail API** for Tylica email detection

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Environment variables configured (see `.env.example`)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd nexus-v5
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nexus_v5"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI Integrations
OPENAI_API_KEY="sk-your-openai-api-key"

# SMS/Phone
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# Gmail Integration
GMAIL_CLIENT_ID="your-gmail-client-id"
GMAIL_CLIENT_SECRET="your-gmail-client-secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Run Prisma Studio for database management
npm run db:studio
```

### 4. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📁 Project Structure

```
nexus-v5/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── leads/        # Lead management
│   │   │   ├── finance/      # Financial transactions
│   │   │   ├── team/         # Team management
│   │   │   └── founder/      # Founder controls
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard         # Main dashboard
│   │   ├── crm/              # CRM pages
│   │   ├── dial/             # Dial session
│   │   ├── finance/          # Finance dashboard
│   │   ├── recruit/          # Recruit portal
│   │   ├── manager/          # Manager dashboard
│   │   └── founder/          # Founder dashboard
│   ├── components/
│   │   ├── ui/               # UI components
│   │   └── dashboard-layout.tsx
│   ├── lib/
│   │   ├── auth.ts           # Auth configuration
│   │   ├── prisma.ts         # Prisma client
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── index.ts          # Type definitions
└── public/                   # Static assets
```

## 🔐 Authentication & Authorization

### User Roles
- **RECRUIT**: New applicant, not yet licensed
- **AGENT**: Licensed agent with basic permissions
- **SENIOR_AGENT**: High-performing agent with mentoring capabilities
- **MANAGER**: Team leader with oversight responsibilities
- **AGENCY_OWNER**: Runs an entire agency/unit
- **FOUNDER**: Top-level system administrator
- **PLATFORM_OWNER**: Technical superuser

### Role-Based Access Control
- Middleware enforces role-based route access
- API endpoints validate user permissions
- UI components show/hide based on user role

## 📊 Key Workflows

### 1. Recruit Lifecycle
1. **NEW**: Initial application state
2. **SUBMITTED_TO_TYLICA**: Sent to Wolfpack for review
3. **AWAITING_FFL_EMAILS**: Waiting for FFL onboarding
4. **LICENSED**: Successfully licensed
5. **ACTIVATED**: Full agent access granted

### 2. Lead Management
1. Lead creation (manual or batch import)
2. Status progression: NEW → CONTACTED → SET → SAT → CLOSED
3. Activity logging for audit trail
4. Duplicate detection and vendor quality tracking

### 3. Financial Tracking
1. Transaction categorization (INCOME, EXPENSE, TAX, LEAD_SPEND, SAVINGS)
2. Automatic tax reserve calculations (25% of income)
3. ROI analysis per lead batch
4. Savings goal tracking

### 4. Dial Sessions
1. Queue generation based on lead status and calling hours
2. Call logging with disposition tracking
3. Real-time session statistics
4. AI-powered script suggestions

## 🤖 AI Integration

### AI Mentor
- Behavioral feedback based on call patterns
- Script optimization suggestions
- Drift detection and early warning system
- Performance improvement recommendations

### Underwriting Helper
- Risk assessment assistance
- Product recommendations
- Application review support

### Script Engine
- Dynamic script generation
- Objection handling suggestions
- Personalization based on lead data

## 📈 Performance & Scalability

### Database Optimization
- Indexed queries for fast data retrieval
- Efficient Prisma query patterns
- Connection pooling for concurrent users

### Frontend Optimization
- Lazy loading of components
- Optimized re-renders with React hooks
- Efficient data fetching patterns

### Caching Strategy
- Session management with NextAuth
- Static asset optimization
- Database query result caching

## 🔧 Configuration

### Environment Variables
All sensitive configuration is handled through environment variables:

- Database connection strings
- API keys for third-party services
- Authentication secrets
- Application settings

### Feature Flags
System features can be enabled/disabled through configuration:

```typescript
// Example feature flag usage
const features = {
  aiMentor: process.env.ENABLE_AI_MENTOR === 'true',
  dialSessions: process.env.ENABLE_DIAL_SESSIONS === 'true',
  financialTracking: process.env.ENABLE_FINANCE === 'true'
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Requirements
- Node.js 18+ runtime
- PostgreSQL 14+ database
- 2GB+ RAM recommended
- SSD storage for optimal performance

## 📚 Documentation

### API Documentation
- RESTful API endpoints under `/api/`
- OpenAPI specification available at `/api/docs`
- Authentication required for most endpoints

### Database Schema
- Prisma schema defines all data models
- Migration system for schema updates
- Relationship mapping between entities

### Component Library
- shadcn/ui components with custom styling
- Dark mode support by default
- Responsive design patterns

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use conventional commit messages
3. Write comprehensive tests
4. Document new features
5. Maintain backward compatibility

### Code Style
- ESLint configuration included
- Prettier for code formatting
- Consistent component patterns
- Meaningful variable names

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the FAQ documentation

## 📄 License

This project is proprietary software. All rights reserved.

---

**NEXUS V5** - Built for the next generation of life insurance agents.