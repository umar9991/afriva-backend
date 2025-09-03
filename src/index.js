// require("dotenv").config();
// const express = require('express');
// const helmet = require('helmet');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const mongoose = require('mongoose');
// const productRoutes = require("./routes/productRoutes");
// const authRoutes = require("./routes/authRoutes");
// const config = require("./config/environment");

// const app = express();

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
    
//     const allowedOrigins = [
//       'http://localhost:5173',
//       'http://localhost:3000',
//       'https://afriva-frontend.vercel.app',
//       'https://afriva-frontend-git-main-umar-ahmads-projects-36ca04f7.vercel.app'
//     ];
    
//     console.log('CORS check for origin:', origin);
    
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       console.log('CORS blocked origin:', origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ["GET", "PATCH", "POST", "PUT", "DELETE"],
//   credentials: true,
//   optionsSuccessStatus: 200,
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

// app.use(helmet());
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
//   next();
// });

// const connectDB = async () => {
//   try {
//     const mongoURL = config.MONGO_URL;
//     if (!mongoURL) {
//       console.error('❌ MONGO_URL environment variable is not set!');
//       console.error('❌ Please set MONGO_URL in your Vercel environment variables');
//       console.error('❌ Example: mongodb+srv://username:password@cluster.mongodb.net/afriva');
//       return; 
//     }
    
//     console.log("🔌 Connecting to database...");
//     console.log("🔌 MongoDB URL:", mongoURL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
//     const connectionOptions = {
//       serverSelectionTimeoutMS: 30000,
//       socketTimeoutMS: 45000,
//       connectTimeoutMS: 30000,
//       retryWrites: true,
//       w: 'majority'
//     };
    
//     console.log("🔌 Connection options:", connectionOptions);
    
//     await mongoose.connect(mongoURL, connectionOptions);
//     console.log("✅ Database Connected Successfully");
//     console.log("✅ Connection state:", mongoose.connection.readyState);
    
//     mongoose.connection.on('error', (err) => {
//       console.error('❌ MongoDB connection error:', err);
//     });
    
//     mongoose.connection.on('disconnected', () => {
//       console.warn('⚠️ MongoDB disconnected');
//     });
    
//     mongoose.connection.on('reconnected', () => {
//       console.log('✅ MongoDB reconnected');
//     });
    
//   } catch (err) {
//     console.error("❌ Database Connection Error:", err.message);
//     console.error("❌ Error code:", err.code);
//     console.error("❌ Error name:", err.name);
    
//     console.warn("⚠️ Continuing without database connection...");
//   }
// };

// process.on('uncaughtException', (err) => {
//   console.error('❌ Uncaught Exception:', err);
//   console.warn('⚠️ Server continuing...');
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
//   console.warn('⚠️ Server continuing...');
// });

// connectDB();


// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);

// app.get('/', (req, res) => {
//   const dbStatus = mongoose.connection.readyState;
//   const dbStatusText = {
//     0: 'disconnected',
//     1: 'connected',
//     2: 'connecting',
//     3: 'disconnecting'
//   }[dbStatus] || 'unknown';
  
//   res.json({ 
//     message: 'Hello from the server',
//     status: 'running',
//     timestamp: new Date().toISOString(),
//     environment: config.NODE_ENV,
//     database: {
//       status: dbStatusText,
//       readyState: dbStatus,
//       connected: dbStatus === 1,
//       host: mongoose.connection.host || 'unknown',
//       name: mongoose.connection.name || 'unknown'
//     },
//     cors: 'enabled',
//     allowedOrigins: [
//       'http://localhost:5173',
//       'http://localhost:3000',
//       'https://afriva-frontend.vercel.app',
//       'https://afriva-frontend-git-main-umar-ahmads-projects-36ca04f7.vercel.app'
//     ],
//     endpoints: {
//       auth: '/api/auth',
//       products: '/api/products'
//     },
//     environment_variables: {
//       MONGO_URL: config.MONGO_URL ? 'Set' : 'Not Set',
//       NODE_ENV: config.NODE_ENV,
//       TOKEN_SECRET: config.TOKEN_SECRET ? 'Set' : 'Not Set'
//     }
//   }); 
// });

// app.get('/health', (req, res) => {
//   const dbStatus = mongoose.connection.readyState;
//   const dbStatusText = {
//     0: 'disconnected',
//     1: 'connected',
//     2: 'connecting',
//     3: 'disconnecting'
//   }[dbStatus] || 'unknown';
  
//   res.json({
//     status: dbStatus === 1 ? 'healthy' : 'unhealthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     database: {
//       status: dbStatusText,
//       readyState: dbStatus,
//       connected: dbStatus === 1,
//       host: mongoose.connection.host || 'unknown',
//       name: mongoose.connection.name || 'unknown'
//     },
//     environment: {
//       NODE_ENV: config.NODE_ENV,
//       MONGO_URL: config.MONGO_URL ? 'Set' : 'Not Set'
//     }
//   });
// });

// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`,
//     availableRoutes: [
//       '/',
//       '/health',
//       '/api/auth/signup',
//       '/api/auth/signin',
//       '/api/auth/signout',
//       '/api/auth/sendVerificationCode',
//       '/api/auth/verify-otp',
//       '/api/products'
//     ]
//   });
// });

// app.use((err, req, res, next) => {
//   console.error('Error:', err);
  
//   if (err.message === 'Not allowed by CORS') {
//     return res.status(403).json({
//       success: false,
//       message: 'CORS error: Origin not allowed',
//       origin: req.get('Origin'),
//       allowedOrigins: [
//         'http://localhost:5173',
//         'http://localhost:3000',
//         'https://afriva-frontend.vercel.app',
//         'https://afriva-frontend-git-main-umar-ahmads-projects-36ca04f7.vercel.app'
//       ]
//     });
//   }
  
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error',
//     error: config.NODE_ENV === 'development' ? err.message : 'Something went wrong'
//   });
// });

// module.exports = app;

// if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
//   const PORT = config.PORT || 8000;
  
//   const server = app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`📍 Environment: ${config.NODE_ENV}`);
//     console.log(`🌐 Frontend URL: ${Array.isArray(config.FRONTEND_URL) ? config.FRONTEND_URL.join(', ') : config.FRONTEND_URL}`);
//     console.log(`🔗 Health check: http://localhost:${PORT}/health`);
//   });

//   process.on('SIGTERM', () => {
//     console.log('SIGTERM received, shutting down gracefully');
//     server.close(() => {
//       console.log('Process terminated');
//       process.exit(0);
//     });
//   });

//   process.on('SIGINT', () => {
//     console.log('SIGINT received, shutting down gracefully');
//     server.close(() => {
//       console.log('Process terminated');
//       process.exit(0);
//     });
//   });
// }


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

// Enhanced connection function with proper serverless handling
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("✅ Using existing database connection");
      return;
    }
    
    // Check if connecting
    if (mongoose.connection.readyState === 2) {
      console.log("🔌 Database connection in progress, waiting...");
      return new Promise((resolve, reject) => {
        mongoose.connection.once('connected', () => {
          console.log("✅ Database connection established");
          resolve();
        });
        mongoose.connection.once('error', (err) => {
          console.error("❌ Database connection failed:", err);
          reject(err);
        });
        
        // Timeout after 30 seconds
        setTimeout(() => {
          reject(new Error('Database connection timeout'));
        }, 30000);
      });
    }
    
    const mongoURL = config.MONGO_URL;
    if (!mongoURL) {
      console.error('❌ MONGO_URL environment variable is not set!');
      console.error('❌ Please set MONGO_URL in your Vercel environment variables');
      console.error('❌ Example: mongodb+srv://username:password@cluster.mongodb.net/afriva');
      throw new Error('MONGO_URL not configured');
    }
    
    console.log("🔌 Connecting to database...");
    console.log("🔌 MongoDB URL:", mongoURL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    // Enhanced connection options for serverless environment
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000,     // 30 seconds
      socketTimeoutMS: 45000,              // 45 seconds
      connectTimeoutMS: 30000,             // 30 seconds
      retryWrites: true,
      w: 'majority',
      bufferCommands: false,               // Critical: Disable mongoose buffering
      bufferMaxEntries: 0,                 // Critical: Disable mongoose buffering
      maxPoolSize: 10,                     // Connection pool size
      serverSelectionRetryDelayMS: 5000,   // Retry delay
      heartbeatFrequencyMS: 10000,         // Heartbeat frequency
      maxIdleTimeMS: 30000,                // Close connections after 30s of inactivity
    };
    
    console.log("🔌 Connection options:", connectionOptions);
    
    await mongoose.connect(mongoURL, connectionOptions);
    console.log("✅ Database Connected Successfully");
    console.log("✅ Connection state:", mongoose.connection.readyState);
    
    // Enhanced event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    mongoose.connection.on('close', () => {
      console.log('🔌 MongoDB connection closed');
    });
    
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
    console.error("❌ Error code:", err.code);
    console.error("❌ Error name:", err.name);
    
    // For serverless, we should throw the error instead of continuing
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw err;
    } else {
      console.warn("⚠️ Continuing without database connection (development mode)...");
    }
  }
};

// Enhanced error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️ Server continuing (development mode)...');
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️ Server continuing (development mode)...');
  }
});

// Middleware to ensure database connection before handling requests
const ensureDBConnection = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("🔌 Database not connected, attempting to connect...");
      await connectDB();
    }
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
        error: 'SERVICE_UNAVAILABLE'
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ Database connection middleware error:', error);
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: 'DATABASE_CONNECTION_ERROR'
    });
  }
};

// Initialize database connection
connectDB();

// Apply database connection middleware to API routes
app.use("/api/auth", ensureDBConnection, authRoutes);
app.use("/api/products", ensureDBConnection, productRoutes);

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

app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbStatus] || 'unknown';
  
  // Test database connectivity
  let dbHealth = 'unknown';
  try {
    if (dbStatus === 1) {
      await mongoose.connection.db.admin().ping();
      dbHealth = 'healthy';
    } else {
      dbHealth = 'unhealthy';
    }
  } catch (error) {
    dbHealth = 'error';
    console.error('Database health check failed:', error);
  }
  
  res.json({
    status: dbStatus === 1 && dbHealth === 'healthy' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: {
      status: dbStatusText,
      readyState: dbStatus,
      connected: dbStatus === 1,
      health: dbHealth,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    },
    environment: {
      NODE_ENV: config.NODE_ENV,
      MONGO_URL: config.MONGO_URL ? 'Set' : 'Not Set',
      VERCEL: process.env.VERCEL ? 'true' : 'false'
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
  
  // Handle database timeout errors specifically
  if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
    return res.status(503).json({
      success: false,
      message: 'Database connection timeout',
      error: 'DATABASE_TIMEOUT'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = app;

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
      mongoose.connection.close(() => {
        console.log('Database connection closed');
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      mongoose.connection.close(() => {
        console.log('Database connection closed');
        process.exit(0);
      });
    });
  });
}