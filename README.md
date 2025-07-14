# ManzilCafe 2.0 🏪

A sophisticated virtual social café platform with multi-tenant café spaces, real-time chat, AI bartender integration, voice messaging, virtual ordering, and enterprise-grade security. Experience the future of social interaction in beautifully themed virtual environments.

## 🌟 Features

### Core Functionality
- **Multi-tenant café rooms** with customizable themes and environments
- **Real-time chat** with live message synchronization and typing indicators
- **AI-powered bartender** (Google Gemini) for intelligent conversations and recommendations
- **Voice messaging** with real-time audio recording and playback
- **Virtual ordering system** with menu items, order tracking, and notifications
- **Custom cursor trail effects** for immersive ambient presence
- **User authentication** via Google OAuth with Supabase
- **Responsive design** optimized for desktop and mobile devices

### Security & Enterprise Features
- **Multi-layer AI security** against prompt injection and jailbreak attacks
- **Rate limiting** and input validation for all user interactions
- **Real-time monitoring** and security logging
- **Security headers** and CORS protection
- **Robots.txt** and **llm.txt** for web crawler and AI model guidance
- **Production-ready** deployment with comprehensive error handling

### User Experience
- **Seamless OAuth login** with Google integration
- **Real-time member presence** tracking
- **Live order notifications** and status updates
- **Themed café environments** with unique atmospheres
- **User profile management** with customizable avatars
- **Info panel** with app information and external links

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive styling
- **Framer Motion** for smooth animations
- **Vite** for fast development and optimized builds

### Backend & Services
- **Supabase** for database, real-time subscriptions, and authentication
- **Google Gemini AI** for intelligent bartender interactions
- **PostgreSQL** for robust data storage
- **Real-time subscriptions** for live updates

### Deployment & Infrastructure
- **Netlify** for hosting and CDN
- **Supabase Edge Functions** for serverless backend
- **Google OAuth** for secure authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Cloud Console account (for Gemini API)
- Netlify account (for deployment)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd ManzilCafe2.0
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Supabase Setup
1. Create a new Supabase project
2. Run the database migrations in `supabase/migrations/`
3. Configure Google OAuth in Supabase Authentication settings
4. Set up Row Level Security (RLS) policies

### 4. Google OAuth Configuration
1. Create a Google Cloud Console project
2. Enable Google+ API and OAuth 2.0
3. Configure authorized redirect URIs:
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.netlify.app`

### 5. Start Development
```bash
npm run dev
```
Visit `http://localhost:5173` to see the application.

## 📊 Database Schema

### Core Tables
- **users**: User profiles with roles (visitor, host, moderator)
- **cafes**: Café rooms with themes, capacity, and settings
- **cafe_members**: Active member tracking with real-time updates
- **messages**: Chat messages with AI bartender integration
- **orders**: Virtual menu ordering system with status tracking

### Security Features
- **Row Level Security (RLS)** policies for data protection
- **Real-time subscriptions** with user-specific filtering
- **Input validation** and sanitization
- **Rate limiting** on API endpoints

## 🔒 Security Implementation

### AI Security Measures
- **Multi-layer prompt validation** against injection attacks
- **Jailbreak detection** and prevention
- **Input sanitization** and content filtering
- **Rate limiting** on AI interactions
- **Security logging** and monitoring

### Authentication & Authorization
- **Google OAuth 2.0** with secure token handling
- **Supabase Auth** with JWT tokens
- **Role-based access control** (RBAC)
- **Session management** with automatic refresh

### Data Protection
- **Encrypted data transmission** (HTTPS/WSS)
- **Input validation** on all user inputs
- **SQL injection prevention** via parameterized queries
- **XSS protection** with content sanitization

## 🚀 Deployment Guide

### Netlify Deployment
1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18.x
3. **Environment Variables**: Add all required environment variables
4. **Domain Configuration**: Set up custom domain if needed

### Post-Deployment Configuration
1. **Update OAuth Redirect URLs**:
   - Supabase: Add production domain to allowed redirect URLs
   - Google Console: Update authorized redirect URIs
2. **SSL Certificate**: Netlify provides automatic SSL
3. **CDN**: Netlify's global CDN for optimal performance

### Production Checklist
- [ ] Environment variables configured
- [ ] OAuth redirect URLs updated
- [ ] Database migrations applied
- [ ] Security headers enabled
- [ ] Error monitoring configured
- [ ] Performance optimized
- [ ] Mobile responsiveness tested

## 🎯 AI Bartender Features

The AI bartender (powered by Google Gemini) provides:
- **Intelligent conversations** and contextual responses
- **Menu recommendations** based on user preferences
- **Café ambiance enhancement** through themed interactions
- **Order assistance** and virtual service
- **Multi-language support** for global accessibility

### Usage
Mention "@bartender" in any chat message to interact with the AI bartender.

## 🎨 Customization

### Themes and Styling
- **Tailwind CSS** for easy styling customization
- **Component-based architecture** for modular design
- **CSS custom properties** for theme variables
- **Responsive design** patterns

### Adding New Features
1. **Frontend**: Add components in `src/components/`
2. **Backend**: Create new Supabase tables and functions
3. **AI Integration**: Extend Gemini prompts in `src/lib/gemini.ts`
4. **Real-time**: Add new Supabase subscriptions

## 📱 Mobile Experience

- **Responsive design** optimized for all screen sizes
- **Touch-friendly** interface elements
- **Progressive Web App** (PWA) capabilities
- **Offline functionality** for core features

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📋 Project Structure

```
ManzilCafe2.0/
├── src/
│   ├── components/          # React components
│   ├── lib/                # Utility libraries
│   ├── types/              # TypeScript type definitions
│   └── App.tsx            # Main application
├── supabase/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
└── dist/                   # Production build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in this README
- Review the code comments for implementation details
- Contact the development team

## 🎉 Acknowledgments

- **Supabase** for the excellent backend platform
- **Google Gemini** for AI capabilities
- **Netlify** for seamless deployment
- **Tailwind CSS** for beautiful styling
- **React** and **TypeScript** communities

---

**ManzilCafe 2.0** - Where virtual connections become real experiences ☕✨