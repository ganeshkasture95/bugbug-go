# 🐛 BugBug-Go - Bug Bounty Platform

A modern, full-stack bug bounty platform built with Next.js 15, TypeScript, and Prisma. Connect security researchers with companies to discover and fix vulnerabilities efficiently.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748?style=flat-square&logo=prisma)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

## 🌟 Features

### 🔐 **Authentication & Security**
- JWT-based authentication with refresh tokens
- Two-Factor Authentication (2FA) with TOTP
- Secure password hashing with bcrypt
- Role-based access control (Company/Researcher)

### 🏢 **Company Features**
- Create and manage bug bounty programs
- Set custom reward structures by severity
- Review and validate security reports
- GitHub repository integration
- Real-time notifications
- Researcher enrollment management

### 🔍 **Researcher Features**
- Browse and enroll in bug bounty programs
- Submit detailed security reports
- Track report status and rewards
- XP and ranking system
- Achievement badges
- Public researcher profiles

### 🔗 **GitHub Integration**
- Sync with GitHub repositories
- Link issues to bug bounty programs
- Automatic issue fetching
- Repository information display
- Maintainer contact integration

### 📊 **Analytics & Tracking**
- Comprehensive dashboard analytics
- Report status tracking
- Reward management system
- User activity monitoring
- Program performance metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- SMTP email service (for 2FA)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bugbug-go.git
   cd bugbug-go
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/bugbounty"
   JWT_SECRET="your-super-secure-jwt-secret"
   JWT_REFRESH_SECRET="your-super-secure-refresh-secret"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern React state management

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication

### **Security**
- **bcryptjs** - Password hashing
- **jose** - JWT handling
- **speakeasy** - TOTP 2FA implementation
- **qrcode** - QR code generation for 2FA

### **Email & Notifications**
- **Nodemailer** - Email sending
- **Real-time notifications** - In-app notification system

## 📁 Project Structure

```
bugbug-go/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── programs/          # Program management
│   │   ├── profile/           # User profiles
│   │   └── reports/           # Report management
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # Authentication service
│   │   ├── prisma.ts         # Database client
│   │   └── notifications.ts   # Notification service
│   └── middleware.ts          # Next.js middleware
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── .env.example             # Environment variables template
├── next.config.js           # Next.js configuration
├── vercel.json             # Vercel deployment config
└── DEPLOYMENT.md           # Deployment guide
```

## 🎯 User Flows

### **Company Workflow**
1. Register as a company
2. Set up 2FA for security
3. Create bug bounty programs
4. Configure GitHub integration (optional)
5. Review and validate reports
6. Manage rewards and payouts

### **Researcher Workflow**
1. Register as a security researcher
2. Browse available programs
3. Enroll in interesting programs
4. Submit security reports
5. Track report status
6. Earn XP and rewards

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/2fa/setup` - Set up 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA token

### **Programs**
- `GET /api/programs` - List all programs
- `POST /api/programs` - Create new program
- `GET /api/programs/[id]` - Get program details
- `PUT /api/programs/[id]` - Update program
- `DELETE /api/programs/[id]` - Delete program

### **Reports**
- `GET /api/reports` - List user reports
- `POST /api/reports` - Submit new report
- `PATCH /api/reports/[id]/status` - Update report status

### **GitHub Integration**
- `GET /api/programs/[id]/github-sync` - Get GitHub data
- `POST /api/programs/[id]/github-sync` - Sync GitHub issues

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### **Other Platforms**
The application can be deployed on any platform that supports Node.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify
- Netlify

## 🔒 Security Features

- **Secure Authentication** - JWT with refresh tokens
- **Password Security** - bcrypt hashing with configurable rounds
- **2FA Support** - TOTP-based two-factor authentication
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma ORM with parameterized queries
- **XSS Protection** - React's built-in XSS protection
- **CSRF Protection** - SameSite cookie configuration

## 🧪 Testing

```bash
# Run type checking
npm run build

# Run linting
npm run lint

# Generate Prisma client
npm run db:generate

# Reset database (development only)
npm run db:push
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Prisma](https://prisma.io/) - Next-generation ORM for Node.js
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vercel](https://vercel.com/) - Platform for frontend frameworks

## 📞 Support

If you have any questions or need help:

1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review the API documentation above
3. Open an issue on GitHub
4. Contact the maintainers

---

**Built with ❤️ for the security community**

*Making the web safer, one bug at a time.*