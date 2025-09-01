const config = {
  MONGO_URL: process.env.MONGO_URL,
  
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'your-secret-key-change-in-production',
  
  NODE_CODE_SENDING_EMAIL_ADDRESS: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
  NODE_CODE_SENDING_EMAIL_PASSWORD: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
  HMAC_VERIFICATION_CODE_SECRET: process.env.HMAC_VERIFICATION_CODE_SECRET || 'your-hmac-secret-change-in-production',
  
  FRONTEND_URL: (() => {
    const urls = process.env.FRONTEND_URL || [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://afriva-frontend.vercel.app",
      "https://afriva-frontend-git-main-umar-ahmads-projects-36ca04f7.vercel.app"
    ];
    
    if (typeof urls === 'string') {
      return urls.replace(/\/$/, ''); 
    }
    
    if (Array.isArray(urls)) {
      return urls.map(url => url.replace(/\/$/, '')); 
    }
    
    return urls;
  })(),
  
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  PORT: process.env.PORT || 8000
};

module.exports = config;
