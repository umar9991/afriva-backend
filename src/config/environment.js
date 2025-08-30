// Environment Configuration
const config = {
  // Database
  MONGO_URL: process.env.MONGO_URL,
  
  // JWT
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'your-secret-key-change-in-production',
  
  // Email
  NODE_CODE_SENDING_EMAIL_ADDRESS: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
  NODE_CODE_SENDING_EMAIL_PASSWORD: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
  HMAC_VERIFICATION_CODE_SECRET: process.env.HMAC_VERIFICATION_CODE_SECRET || 'your-hmac-secret-change-in-production',
  
  // Frontend URLs
  FRONTEND_URL: process.env.FRONTEND_URL || [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://afriva-frontend.vercel.app", // Remove trailing slash
    "https://afriva-frontend-git-main-umar-ahmads-projects-36ca04f7.vercel.app" // Add https://
  ],
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Port
  PORT: process.env.PORT || 8000
};

module.exports = config;
