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





// server.js - Using Nodemailer for Email
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import nodemailer from 'nodemailer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Check if dist folder exists
const distExists = existsSync(join(__dirname, 'dist'));
console.log('📁 dist exists:', distExists);

// Middleware
app.use(express.json());

// Serve static files from dist folder
if (distExists) {
  app.use(express.static(join(__dirname, 'dist')));
  console.log('✅ Serving static files from dist/');
}

// ============ EMAIL CONFIGURATION ============

// Create email transporter
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('✅ Email configured with:', process.env.EMAIL_USER);
} else {
  console.log('⚠️ Email not configured (missing EMAIL_USER or EMAIL_PASS)');
}

// ============ API ROUTES ============

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Fresher Hub',
    timestamp: new Date().toISOString(),
    email: !!transporter
  });
});

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  console.log('📧 OTP request:', req.body?.email);
  
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and OTP required' 
      });
    }
    
    // Try sending email if transporter is configured
    if (transporter) {
      console.log('📤 Attempting to send email to:', email);
      
      try {
        const mailOptions = {
          from: `"Fresher Hub" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Password Reset OTP - Fresher Hub',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Password Reset</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>You requested to reset your password. Use the OTP code below to continue:</p>
                  <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                  </div>
                  <p><strong>⏱️ This code expires in 10 minutes.</strong></p>
                  <p>If you didn't request this, please ignore this email.</p>
                  <div class="footer">
                    <p>This is an automated email from Fresher Hub</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `Your OTP is: ${otp}. It expires in 10 minutes.`
        };
        
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully');
        
        return res.json({
          success: true,
          message: 'OTP sent to your email',
          service: 'Nodemailer'
        });
        
      } catch (emailError) {
        console.error('❌ Email failed:', emailError.message);
        // Continue to fallback
      }
    }
    
    // Fallback: Mock response (no email sent)
    console.log(`📝 Mock OTP for ${email}: ${otp}`);
    
    res.json({
      success: true,
      message: 'OTP generated',
      otp: otp,
      service: 'Mock',
      note: 'Email not configured - check this response for your OTP',
      instructions: `Use this OTP on verification page: ${otp}`
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// ============ SPA ROUTING ============

// Load index.html for SPA
let indexHtml = null;
if (distExists) {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html');
    if (existsSync(indexPath)) {
      indexHtml = readFileSync(indexPath, 'utf8');
      console.log('✅ Loaded index.html for SPA routing');
    }
  } catch (err) {
    console.error('Error loading index.html:', err.message);
  }
}

// SPA fallback handler - NO WILDCARDS
const handleSPA = (req, res, next) => {
  // Don't handle API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Don't handle static files (they have extensions)
  if (req.path.match(/\.[a-zA-Z0-9]{2,}$/)) {
    return next();
  }
  
  // Serve index.html for SPA routing
  if (indexHtml) {
    return res.send(indexHtml);
  }
  
  // No index.html found
  next();
};

// Apply SPA handler
app.use(handleSPA);

// General 404 handler (handles both API and non-API routes)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false,
      error: 'API endpoint not found',
      path: req.path 
    });
  }
  
  if (indexHtml) {
    return res.send(indexHtml);
  }
  
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fresher Hub - Not Found</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
        h1 { color: #667eea; }
        code { background: #f5f5f5; padding: 10px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>404 - Page Not Found</h1>
      <p>The requested URL <code>${req.path}</code> was not found.</p>
      <p><a href="/">Go to Homepage</a></p>
    </body>
    </html>
  `);
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Email configured: ${transporter ? '✅ Yes' : '❌ No (using mock)'}`);
  console.log(`📁 SPA routing: ${indexHtml ? '✅ Enabled' : '❌ Disabled'}`);
});