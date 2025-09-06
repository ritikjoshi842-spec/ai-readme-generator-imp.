# README Generator

## Overview

This is a full-stack web application that automatically generates professional README documentation for GitHub repositories using AI. The application analyzes GitHub repositories, extracts project structure and metadata, and uses Google's Gemini AI to create comprehensive, well-formatted README files. It features a modern React frontend with TypeScript, shadcn/ui components, and a Node.js/Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark theme support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for README generation and repository validation
- **Request Processing**: Multi-step processing pipeline with real-time status updates
- **Error Handling**: Centralized error handling with meaningful error messages
- **Logging**: Custom request/response logging middleware

### Data Storage Solutions
- **Primary Storage**: PostgreSQL database with Drizzle ORM
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Fallback Storage**: In-memory storage implementation for development
- **Session Management**: PostgreSQL session store with connect-pg-simple

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Handling**: Basic session management infrastructure in place
- **Future Considerations**: Ready for user authentication integration

## External Dependencies

### AI Services
- **Google Gemini AI**: Primary AI service for content generation using @google/genai SDK
- **Content Generation**: Automated description, features, and documentation creation
- **API Integration**: Environment variable configuration for API keys

### GitHub Integration
- **GitHub API**: Repository metadata and content fetching via @octokit/rest
- **Repository Analysis**: Automated project structure detection and technology stack identification
- **Rate Limiting**: Built-in handling for GitHub API rate limits
- **Access Control**: Support for both public repositories and private repositories with tokens

### UI Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Lucide React**: Modern icon library with consistent design
- **shadcn/ui**: Pre-built component library with customizable design system

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast build tool with HMR and optimized production builds
- **ESBuild**: Backend bundling for production deployment
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### Database and ORM
- **Drizzle ORM**: Type-safe database operations with schema validation
- **Neon Database**: Serverless PostgreSQL with automatic scaling
- **Connection Pooling**: Efficient database connection management