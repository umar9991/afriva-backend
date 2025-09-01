const jwt = require('jsonwebtoken');
const { signupSchema, signinSchema } = require("../middlewares/validator");
const User = require("../models/userModels");
const { doHash, doHashValidaton, hmacProcess } = require("../utils/hashing");
const transport = require('../middlewares/sendMail');
const config = require('../config/environment');

exports.signup = async (req, res) => {
  console.log("in signup======>", req.body);
  
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      console.log("Validation failed:", error.details);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password, confirmPassword } = value;
    console.log("email===>", email);
  
    // Make email search case-insensitive
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    if (existingUser) {
      console.log('❌ User already exists with email:', email);
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }
    console.log("existingUser====>", existingUser);

    const hashedPassword = await doHash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      confirmPassword: confirmPassword || email.split('@')[0]
    });
    console.log("newUser===>", newUser);
  
    newUser.password = undefined;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: newUser
      },
    });

  } catch (error) {
    console.error("Signup error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: config.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Signin Request:', { email });
  
  try {
    const { error, value } = signinSchema.validate({ email, password });
    if (error) {
      console.log("Validation failed:", error.details);
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }
    
    // Make email search case-insensitive
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    }).select('+password');
    
    if (!existingUser) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: "User does not exist!",
      });
    }
    
    console.log('✅ User found for signin:', existingUser.email);
    
    const result = await doHashValidaton(password, existingUser.password);
    if (!result) {
      console.log('❌ Invalid password for user:', existingUser.email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials!",
      });
    }
    
    console.log('✅ Password validated for user:', existingUser.email);
    
    const token = jwt.sign({
      userId: existingUser._id,
      email: existingUser.email,
      verified: existingUser.verified,
    },
    config.TOKEN_SECRET,
    {
      expiresIn: '8h',
    });

    // Set cookie for production, but handle Vercel deployment
    const cookieOptions = {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: config.NODE_ENV === 'production',
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    console.log('✅ Signin successful for user:', existingUser.email);

    res.cookie('Authorization', 'Bearer ' + token, cookieOptions)
      .json({
        success: true,
        token,
        message: 'Logged in Successfully',
        user: {
          id: existingUser._id,
          email: existingUser.email,
          verified: existingUser.verified
        }
      });

  } catch (error) {
    console.error("❌ Signin error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during signin",
      error: config.NODE_ENV === 'development' ? error.message : undefined
    });
  } 
};

exports.signout = async (req, res) => {
  try {
    res.clearCookie('Authorization', {
      httpOnly: config.NODE_ENV === 'production',
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    .status(200)
    .json({ success: true, message: 'Logged out successfully' }); 
  } catch (error) {
    console.error("Signout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during signout"
    });
  }
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  
  console.log('📧 Send Verification Code Request:', { email });
  
  try {
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    console.log('🔍 User search result:', existingUser ? 'User found' : 'User not found');

    if (!existingUser) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({
        success: false,
        message: "User does not exist! Please check your email address.",
      });
    }

    console.log('✅ User found:', {
      id: existingUser._id,
      email: existingUser.email,
      verified: existingUser.verified
    });

    if (existingUser.verified) {
      console.log('⚠️ User already verified:', existingUser.email);
      return res.status(400).json({
        success: false,
        message: "You are already verified!",
      });
    }

    const codeValue = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('🔢 Generated verification code:', codeValue);

    if (!config.NODE_CODE_SENDING_EMAIL_ADDRESS || !config.NODE_CODE_SENDING_EMAIL_PASSWORD) {
      console.warn("⚠️ Email configuration missing, skipping email send");
      return res.status(200).json({
        success: true,
        message: "Verification code generated (email not configured)",
        code: config.NODE_ENV === 'development' ? codeValue : undefined
      });
    }

    console.log('📧 Sending email to:', existingUser.email);
    
    let info = await transport.sendMail({
      from: config.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Verification Code",
      html: `<h1>${codeValue}</h1>`,
    });

    console.log('📧 Email send result:', info);

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        config.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.verificationCode = hashedCodeValue;
      existingUser.verificationCodeValidation = Date.now();
      await existingUser.save();

      console.log('✅ Verification code saved for user:', existingUser.email);
      
      return res.status(200).json({
        success: true,
        message: "Check your mail box. Verify code delivered to your inbox.",
      });
    }

    console.log('❌ Email sending failed for user:', existingUser.email);
    return res.status(400).json({
      success: false,
      message: "Code sending failed! Please try again.",
    });
  } catch (error) {
    console.error("❌ Send verification code error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  
  console.log('🔍 OTP Verification Request:', { email, otp });

  try {
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    }).select('+verificationCode +verificationCodeValidation');

    console.log('🔍 User search result:', existingUser ? 'User found' : 'User not found');

    if (!existingUser) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({
        success: false,
        message: "User not found! Please check your email address.",
      });
    }

    console.log('✅ User found:', {
      id: existingUser._id,
      email: existingUser.email,
      hasVerificationCode: !!existingUser.verificationCode,
      verificationCodeValidation: existingUser.verificationCodeValidation
    });

    if (!existingUser.verificationCode) {
      console.log('❌ No verification code found for user:', existingUser.email);
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new code.",
      });
    }

    const now = Date.now();
    const codeAge = now - existingUser.verificationCodeValidation;
    const expiryTime = 10 * 60 * 1000; // 10 minutes

    console.log('⏰ Code age check:', {
      now,
      codeValidationTime: existingUser.verificationCodeValidation,
      codeAge,
      expiryTime,
      isExpired: codeAge > expiryTime
    });

    if (codeAge > expiryTime) {
      console.log('❌ Verification code expired for user:', existingUser.email);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    const hashedProvidedOtp = hmacProcess(
      String(otp).trim(),
      config.HMAC_VERIFICATION_CODE_SECRET
    );

    console.log('🔐 OTP comparison:', {
      providedOtp: otp,
      hashedProvidedOtp: hashedProvidedOtp.substring(0, 10) + '...',
      storedVerificationCode: existingUser.verificationCode.substring(0, 10) + '...',
      match: hashedProvidedOtp === existingUser.verificationCode
    });

    if (hashedProvidedOtp !== existingUser.verificationCode) {
      console.log('❌ Invalid OTP for user:', existingUser.email);
      return res.status(400).json({
        success: false,
        message: "Invalid verification code! Please check and try again.",
      });
    }

    console.log('✅ OTP verified successfully for user:', existingUser.email);

    existingUser.verified = true;
    existingUser.verificationCode = undefined;
    existingUser.verificationCodeValidation = undefined;
    await existingUser.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      user: {
        id: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
    });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
  