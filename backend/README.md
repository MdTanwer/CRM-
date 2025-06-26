# CRM Backend API

A professional, production-ready TypeScript backend for a Customer Relationship Management (CRM) system built with Express.js and MongoDB.

## 🚀 Features

- **TypeScript** - Full TypeScript support with strict type checking
- **Express.js** - Fast, unopinionated web framework for Node.js
- **MongoDB** - NoSQL database with Mongoose ODM
- **Security** - Comprehensive security middleware (Helmet, CORS, Rate Limiting)
- **Authentication** - JWT-based authentication system
- **Validation** - Request validation with express-validator
- **Error Handling** - Centralized error handling with custom error classes
- **Logging** - Request logging with Morgan
- **Configuration** - Environment-based configuration management
- **Database Seeding** - Automated database seeding for development
- **Graceful Shutdown** - Proper server and database connection cleanup

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🛠 Installation

1. Clone the repository and navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment file:

   ```bash
   # Create .env file with the following variables:
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/crm_database
   DATABASE_NAME=crm_database
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

This starts the server with hot reloading using nodemon.

### Production Mode

```bash
npm start
```

This runs the compiled JavaScript from the `dist` directory.

### Database Seeding

```bash
# Seed the database with sample data
npm run seed

# Clear all data from the database
npm run seed:clear
```

## 📁 Project Structure

```
backend/
├── controller/          # Request handlers
├── middleware/          # Custom middleware functions
├── models/             # Mongoose models and schemas
│   └── User.ts         # User model with validation
├── routes/             # Express route definitions
├── utils/              # Utility functions and classes
│   ├── config.ts       # Configuration management
│   ├── database.ts     # MongoDB connection handler
│   ├── errorHandler.ts # Error handling utilities
│   └── seeder.ts       # Database seeding utilities
├── app.ts              # Express application setup
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## 🔧 Configuration

The application uses environment variables for configuration. Key variables include:

| Variable         | Description               | Default                                |
| ---------------- | ------------------------- | -------------------------------------- |
| `PORT`           | Server port               | 3000                                   |
| `NODE_ENV`       | Environment               | development                            |
| `MONGODB_URI`    | MongoDB connection string | mongodb://localhost:27017/crm_database |
| `JWT_SECRET`     | JWT signing secret        | (required)                             |
| `JWT_EXPIRES_IN` | JWT expiration time       | 7d                                     |
| `FRONTEND_URL`   | Frontend URL for CORS     | http://localhost:3000                  |

## 🔐 Security Features

- **Helmet** - Sets various HTTP headers for security
- **CORS** - Configured Cross-Origin Resource Sharing
- **Rate Limiting** - API rate limiting to prevent abuse
- **Password Hashing** - Bcrypt with salt rounds
- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Request validation and sanitization

## 📊 API Endpoints

### Health Check

- `GET /health` - Server health status and database connection

### API Base

- `GET /api/v1` - API status endpoint

## 🗄️ Database

### User Model

The User model includes:

- Personal information (firstName, lastName, email)
- Authentication (password with bcrypt hashing)
- Authorization (role-based access: admin, manager, user)
- Account status (isActive, emailVerified)
- Timestamps (createdAt, updatedAt, lastLogin)

### Features:

- Automatic password hashing
- Email validation and uniqueness
- Database indexes for performance
- Custom instance and static methods
- Soft delete protection for admin users

## 🔄 Database Connection

The application uses a singleton pattern for database connectivity with:

- Connection pooling (max 10 connections)
- Automatic reconnection
- Graceful shutdown handling
- Connection status monitoring
- Error event handling

## 🛡️ Error Handling

Comprehensive error handling includes:

- Custom AppError class for operational errors
- Global error handler middleware
- Environment-specific error responses
- MongoDB-specific error handling
- Unhandled promise rejection handling
- Uncaught exception handling

## 📝 Logging

- Development: Detailed request logging with colors
- Production: Combined log format for monitoring
- Error logging with stack traces in development
- Request/response time tracking

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure MongoDB Atlas or production database
4. Set up proper CORS origins
5. Configure reverse proxy (nginx)
6. Set up SSL/TLS certificates
7. Configure process manager (PM2)
8. Set up monitoring and logging

## 📈 Performance Optimizations

- Response compression with gzip
- Database connection pooling
- Efficient MongoDB indexes
- Request rate limiting
- Memory-efficient error handling
- Optimized middleware ordering

## 🧪 Testing

```bash
npm test
```

(Test framework to be implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Tanwir** - Backend Developer

---

For questions or support, please contact the development team.
