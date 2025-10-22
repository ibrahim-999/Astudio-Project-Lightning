# Project Lightning - System Architecture

## Overview
AI-Native ERP system for creative agencies with three core modules: HR, Projects, and Finance.

## Architecture Diagram
┌─────────────────────────────────────────┐
│           FRONTEND (Next.js 14)         │
│  - React Components                     │
│  - TypeScript                           │
│  - Tailwind CSS                         │
│  - Supabase Auth Client                 │
└──────────────────┬──────────────────────┘
│ HTTPS/REST
│
┌──────────────────▼──────────────────────┐
│        BACKEND (FastAPI + Python)       │
│  ┌────────────────────────────────────┐ │
│  │   AI Service Layer (Claude 4.5)    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  HR Module  │  PM Module │ Finance │ │
│  │  - Interview│  - Projects│ - Expense│ │
│  │  - Analysis │  - Tasks   │ - Tracking│ │
│  └────────────────────────────────────┘ │
└──────────────────┬──────────────────────┘
│
┌──────────────────▼──────────────────────┐
│      DATABASE (Supabase/PostgreSQL)     │
│  - interviews, interview_transcripts    │
│  - projects, tasks                      │
│  - expenses                             │
│  - organizations, users (auth)          │
└─────────────────────────────────────────┘
## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Supabase Auth**: Authentication client

### Backend
- **FastAPI**: High-performance Python API framework
- **Python 3.11+**: Modern Python features
- **Anthropic SDK**: Claude AI integration
- **Supabase Client**: Database operations

### Database
- **Supabase (PostgreSQL)**: Managed database with real-time capabilities
- **Row Level Security**: Built-in data isolation

### AI
- **Claude Sonnet 4.5**: Primary AI for reasoning, analysis, conversation

### Deployment
- **Frontend**: Vercel (recommended)
- **Backend**: Railway / Render (recommended)
- **Database**: Supabase Cloud

## Data Flow

1. **User Request**: User interacts via Next.js frontend
2. **Authentication**: Supabase Auth validates session
3. **API Call**: Frontend calls FastAPI backend
4. **AI Processing**: Backend uses Claude AI for intelligent operations
5. **Database**: Results stored in Supabase PostgreSQL
6. **Response**: Data returned to frontend, UI updates

## Security

- **Authentication**: JWT tokens via Supabase Auth
- **Authorization**: Row Level Security in database
- **API Protection**: CORS configuration, rate limiting
- **Data Isolation**: Organization-level data separation

## Module Details

### HR Module
- AI-powered interview conductor
- 8-question conversational flow
- Real-time transcript storage
- Multi-dimensional analysis (technical, communication, cultural fit)

### Project Management Module
- Natural language project brief → structured project
- AI generates project name, description, tasks
- Automatic timeline estimation
- Task status tracking

### Finance Module
- AI expense categorization (7 categories)
- Confidence scoring
- Category-based summaries
- Expense tracking and visualization

## Scalability Approach

**Phase 1 (Current)**: Single-tenant prototype
- One organization hardcoded
- Proof of concept

**Phase 2 (Production)**: Multi-tenant
- Organization isolation via Row Level Security
- User management with roles
- API rate limiting per organization

**Phase 3 (Scale)**: Performance optimization
- Database read replicas
- Redis caching layer
- CDN for static assets
- Horizontal backend scaling

**Phase 4 (Enterprise)**: Microservices (if needed)
- Separate services per module
- Event-driven architecture
- Message queue (RabbitMQ/Kafka)