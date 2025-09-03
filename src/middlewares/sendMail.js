const nodemailer = require('nodemailer');
const config = require('../config/environment');

let transport = null;

if (config.NODE_CODE_SENDING_EMAIL_ADDRESS && config.NODE_CODE_SENDING_EMAIL_PASSWORD) {
  transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.NODE_CODE_SENDING_EMAIL_ADDRESS,
      pass: config.NODE_CODE_SENDING_EMAIL_PASSWORD,
    },
  });
} else {
  console.warn('Email credentials not configured - email functionality disabled');
}

module.exports = transport;