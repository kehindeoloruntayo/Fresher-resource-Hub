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





// server.js - SendGrid version WITHOUT wildcard issues
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Check if dist folder exists
const distExists = existsSync(join(__dirname, 'dist'));
const indexPath = distExists ? join(__dirname, 'dist', 'index.html') : null;
let indexHtml = '';

if (distExists && indexPath && existsSync(indexPath)) {
  try {
    indexHtml = readFileSync(indexPath, 'utf8');
    console.log('✅ Loaded React build from dist/');
  } catch (err) {
    console.warn('⚠️ Could not read index.html:', err.message);
  }
} else {
  console.warn('⚠️ dist folder not found. Run "npm run build" first.');
}

// Middleware
app.use(express.json());

// Serve static files from dist folder
if (distExists) {
  app.use(express.static(join(__dirname, 'dist')));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Fresher Hub',
    emailService: process.env.SENDGRID_API_KEY ? 'SendGrid' : 'Mock',
    timestamp: new Date().toISOString()
  });
});

// Send OTP with SendGrid
app.post('/api/send-otp', async (req, res) => {
  console.log('📧 OTP request received');
  
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }
    
    // Check if SendGrid API key is configured
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    
    if (!SENDGRID_API_KEY) {
      console.log('⚠️ SendGrid not configured, using mock service');
      return sendMockResponse(res, email, otp);
    }
    
    console.log('Attempting to send email via SendGrid to:', email);
    
    // Send real email with SendGrid
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ 
          to: [{ email }],
          subject: 'Password Reset OTP - Fresher Hub'
        }],
        from: { 
          email: 'noreply@fresherhub.com', 
          name: 'Fresher Hub' 
        },
        content: [
          {
            type: 'text/html',
            value: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
                  .content { padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
                  .otp-box { background: #f8f9fa; padding: 25px; text-align: center; margin: 25px 0; border-radius: 10px; border: 2px dashed #667eea; }
                  .otp-code { font-size: 32px; letter-spacing: 10px; font-weight: bold; color: #333; }
                  .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>🔐 Password Reset</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>You requested to reset your password for Fresher Hub. Use the OTP below:</p>
                  
                  <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <p style="color: #666; margin-top: 10px;">This code expires in 10 minutes</p>
                  </div>
                  
                  <p>If you didn't request this password reset, please ignore this email.</p>
                  <p>Best regards,<br><strong>The Fresher Hub Team</strong></p>
                  
                  <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                  </div>
                </div>
              </body>
              </html>
            `
          }
        ]
      })
    });
    
    if (sgResponse.ok) {
      console.log('✅ Email sent successfully via SendGrid');
      res.json({
        success: true,
        message: 'OTP sent to your email',
        service: 'SendGrid',
        note: 'Check your inbox (and spam folder)'
      });
    } else {
      const errorText = await sgResponse.text();
      console.error('❌ SendGrid API error:', errorText);
      throw new Error(`SendGrid failed: ${sgResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Email error:', error.message);
    // Fallback to mock response
    sendMockResponse(res, req.body?.email, req.body?.otp, error.message);
  }
});

// Mock response function
function sendMockResponse(res, email, otp, error = null) {
  console.log(`📨 Mock response for ${email}: ${otp}`);
  
  res.json({
    success: true,
    message: error ? 'Email service failed, using OTP below' : 'OTP generated (demo mode)',
    otp: otp,
    service: 'Mock',
    error: error,
    instructions: [
      '1. Copy this OTP: ' + otp,
      '2. Go to /verify-otp page',
      '3. Enter the OTP to continue'
    ]
  });
}

// Handle SPA routing WITHOUT wildcard issues
if (indexHtml) {
  // Handle all non-API, non-static file routes
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Skip if it looks like a file request (has extension)
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|txt)$/)) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA)
    res.send(indexHtml);
  });
} else {
  // Development message
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Fresher Hub</title><style>body{font-family:Arial;padding:40px;text-align:center;}</style></head>
      <body>
        <h1>Fresher Hub</h1>
        <p>Run <code>npm run build</code> then refresh.</p>
        <p><a href="/api/health">API Health Check</a></p>
      </body>
      </html>
    `);
  });
}

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log(`📧 OTP: POST http://localhost:${PORT}/api/send-otp`);
  console.log(`📦 React build: ${distExists ? '✅ Loaded' : '❌ Missing (run npm run build)'}`);
  console.log(`🔑 SendGrid: ${process.env.SENDGRID_API_KEY ? '✅ Configured' : '❌ Not configured (using mock)'}`);
});