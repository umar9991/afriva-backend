require("dotenv").config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const config = require("./config/environment");

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://afriva-frontend.vercel.app',
      'https://afriva-frontend-git-main-umar-ahmads-projects-36ca04f7.vercel.app'
    ];
    
    console.log('CORS check for origin:', origin);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "PATCH", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

const connectDB = async () => {
  try {
    const mongoURL = config.MONGO_URL;
    if (!mongoURL) {
      console.error('❌ MONGO_URL environment variable is not set!');
      console.error('❌ Please set MONGO_URL in your Vercel environment variables');
      console.error('❌ Example: mongodb+srv://username:password@cluster.mongodb.net/afriva');
      return; 
    }
    
    console.log("🔌 Connecting to database...");
    console.log("🔌 MongoDB URL:", mongoURL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    // Simple connection options for better reliability
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    };
    
    console.log("🔌 Connection options:", connectionOptions);
    
    await mongoose.connect(mongoURL, connectionOptions);
    console.log("✅ Database Connected Successfully");
    console.log("✅ Connection state:", mongoose.connection.readyState);
    
    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
    console.error("❌ Error code:", err.code);
    console.error("❌ Error name:", err.name);
    
    // Don't crash the server, just log the error
    console.warn("⚠️ Continuing without database connection...");
  }
};

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.warn('⚠️ Server continuing...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.warn('⚠️ Server continuing...');
});

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbStatus] || 'unknown';
  
  res.json({ 
    message: 'Hello from the server',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: {
      status: dbStatusText,
      readyState: dbStatus,
      connected: dbStatus === 1,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    },
    cors: 'enabled',
    allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://afriva-frontend.vercel.app',
      'https://afriva-frontend-git-main-umar-ahmads-projects-36ca04f7.vercel.app'
    ],
    endpoints: {
      auth: '/api/auth',
      products: '/api/products'
    },
    environment_variables: {
      MONGO_URL: config.MONGO_URL ? 'Set' : 'Not Set',
      NODE_ENV: config.NODE_ENV,
      TOKEN_SECRET: config.TOKEN_SECRET ? 'Set' : 'Not Set'
    }
  }); 
});

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbStatus] || 'unknown';
  
  res.json({
    status: dbStatus === 1 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: {
      status: dbStatusText,
      readyState: dbStatus,
      connected: dbStatus === 1,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    },
    environment: {
      NODE_ENV: config.NODE_ENV,
      MONGO_URL: config.MONGO_URL ? 'Set' : 'Not Set'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/',
      '/health',
      '/api/auth/signup',
      '/api/auth/signin',
      '/api/auth/signout',
      '/api/auth/sendVerificationCode',
      '/api/auth/verify-otp',
      '/api/products'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Origin not allowed',
      origin: req.get('Origin'),
      allowedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://afriva-frontend.vercel.app',
        'https://afriva-frontend-git-main-umar-ahmads-projects-36ca04f7.vercel.app'
      ]
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// For Vercel deployment - export the app
module.exports = app;

// Only start server if not on Vercel (for local development)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = config.PORT || 8000;
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${config.NODE_ENV}`);
    console.log(`🌐 Frontend URL: ${Array.isArray(config.FRONTEND_URL) ? config.FRONTEND_URL.join(', ') : config.FRONTEND_URL}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
}
