require("dotenv").config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "PATCH", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGO_URL;
    if (!mongoURL) {
      console.warn('⚠️ MONGO_URL environment variable is not set - database connection will be skipped');
      return; 
    }
    
    console.log("Connecting to database...");
    await mongoose.connect(mongoURL);
    console.log("✅ Database Connected Successfully");
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
};

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from the server',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  }); 
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/',
      '/api/auth/signup',
      '/api/auth/signin',
      '/api/auth/signout',
      '/api/auth/sendVerificationCode',
      '/api/auth/verify-otp',
      '/api/products'
    ]
  });
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
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
