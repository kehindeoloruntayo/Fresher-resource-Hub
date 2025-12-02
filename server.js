// // server.js
// import express from 'express';
// import { Resend } from 'resend';
// import cors from 'cors';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const resend = new Resend(process.env.RESEND_API_KEY);

// app.use(cors());
// app.use(express.json());

// // Debug endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK', 
//     message: 'Server is running',
//     timestamp: new Date().toISOString(),
//     resendConfigured: !!process.env.RESEND_API_KEY 
//   });
// });

// app.post('/send-otp', async (req, res) => {
 
  
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({ error: 'Email and OTP are required' });
//     }

//     const { data, error } = await resend.emails.send({
//       from: 'Fresher Hub <onboarding@resend.dev>',
//       to: [email],
//       subject: 'Password Reset OTP - Fresher Hub',
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Password Reset</title>
//         </head>
//         <body>
//           <h2>Password Reset OTP</h2>
//           <p>Your OTP code is: <strong>${otp}</strong></p>
//           <p>This code expires in 10 minutes.</p>
//         </body>
//         </html>
//       `
//     });

//     if (error) {
//       console.error('❌ Resend error:', error);
//       return res.status(500).json({ 
//         error: 'Failed to send OTP', 
//         details: error.message 
//       });
//     }

//     console.log('✅ Email sent successfully:', data?.id);
//     res.status(200).json({ 
//       message: 'OTP sent successfully', 
//       emailId: data?.id 
//     });
//   } catch (error) {
//     console.error('❌ Server error:', error);
//     res.status(500).json({ 
//       error: 'Failed to send OTP', 
//       details: error.message 
//     });
//   }
// });

// app.post('/send-reset-confirmation', async (req, res) => {
//   try {
//     const { email } = req.body;

//     const { data, error } = await resend.emails.send({
//       from: 'Fresher Hub <onboarding@resend.dev>',
//       to: [email],
//       subject: 'Password Successfully Reset - Fresher Hub',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #4CAF50;">✅ Password Successfully Reset</h2>
//           <p>Hello,</p>
//           <p>Your Fresher Hub password has been successfully reset.</p>
//           <p>If you did not make this change, please contact our support team immediately.</p>
//         </div>
//       `
//     });

//     if (error) throw error;
//     res.status(200).json({ message: 'Confirmation email sent' });
//   } catch (error) {
//     console.error('Error sending confirmation:', error);
//     res.status(500).json({ error: 'Failed to send confirmation email' });
//   }
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(`📧 Health check: http://localhost:${PORT}/health`);
// });


// // server.js - Fixed version
// import express from 'express';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import dotenv from 'dotenv';

// dotenv.config();

// const __dirname = dirname(fileURLToPath(import.meta.url));
// const app = express();

// // Middleware
// app.use(express.json());

// // Serve static files from dist folder (React build)
// app.use(express.static(join(__dirname, 'dist')));

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     service: 'Fresher Hub',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // OTP endpoint (demo mode - no email sending)
// app.post('/api/send-otp', (req, res) => {
//   try {
//     const { email, otp } = req.body;
    
//     if (!email || !otp) {
//       return res.status(400).json({ error: 'Email and OTP required' });
//     }
    
//     console.log(`📧 Demo OTP for ${email}: ${otp}`);
    
//     // Demo mode - return success without actual email
//     res.json({ 
//       success: true, 
//       message: 'OTP generated (demo mode)',
//       otp: otp,
//       note: 'In production, this would be sent via email'
//     });
    
//   } catch (error) {
//     console.error('OTP error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Fix for wildcard route - use regex instead of '*'
// app.get(/\/(?!api).*/, (req, res) => {
//   res.sendFile(join(__dirname, 'dist', 'index.html'));
// });

// // Alternative fix: Use a catch-all that excludes API routes
// // app.use((req, res, next) => {
// //   if (req.path.startsWith('/api/')) {
// //     return next();
// //   }
// //   res.sendFile(join(__dirname, 'dist', 'index.html'));
// // });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`🌐 Frontend: http://localhost:${PORT}`);
//   console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
//   console.log(`📧 OTP API: POST http://localhost:${PORT}/api/send-otp`);
//   console.log(`📁 Serving from: ${join(__dirname, 'dist')}`);
// });





// server.js - FIXED VERSION for Ethereal.email
import express from 'express';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Create a test email account
let transporter;

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  console.log('📧 Test email account created:', testAccount.user);
  console.log('🔑 Test email password:', testAccount.pass);
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  
  return transporter;
}

// Middleware
app.use(express.json());

// Serve static files from dist folder (React build)
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Fresher Hub',
    email: 'Ethereal (test)',
    timestamp: new Date().toISOString()
  });
});

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  console.log('📧 OTP request received:', req.body);
  
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }
    
    if (!transporter) {
      await createTestAccount();
    }
    
    // Send email
    const info = await transporter.sendMail({
      from: '"Fresher Hub" <noreply@fresherhub.com>',
      to: email,
      subject: 'Password Reset OTP - Fresher Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0;">🔐 Password Reset</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <p>Hello,</p>
            <p>You requested to reset your password. Use the OTP below:</p>
            <div style="background: #f8f9fa; padding: 25px; text-align: center; margin: 25px 0; border-radius: 10px;">
              <div style="font-size: 32px; letter-spacing: 10px; font-weight: bold; color: #333;">${otp}</div>
              <p style="color: #666; margin-top: 10px;">This code expires in 10 minutes</p>
            </div>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>The Fresher Hub Team</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📋 Preview URL:', nodemailer.getTestMessageUrl(info));
    
    res.json({
      success: true,
      message: 'OTP sent (test email)',
      previewUrl: nodemailer.getTestMessageUrl(info),
      otp: otp // For testing
    });
    
  } catch (error) {
    console.error('❌ Email error:', error);
    
    // Fallback: return OTP for manual use
    res.json({ 
      success: false, 
      message: 'Email service failed',
      otp: req.body.otp,
      note: 'Use this OTP manually',
      error: error.message
    });
  }
});

// FIXED: SPA fallback without wildcard issues
app.use((req, res, next) => {
  // If it's an API route, continue
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // If it's a static file request, continue
  if (req.path.includes('.')) {
    return next();
  }
  
  // Otherwise, serve index.html for SPA routing
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`📧 OTP API: POST http://localhost:${PORT}/api/send-otp`);
  console.log(`📁 Using Ethereal.email for test emails`);
});