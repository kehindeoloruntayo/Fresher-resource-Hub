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





// server.js - Mock email service for Render
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Check if dist folder exists
const distExists = existsSync(join(__dirname, 'dist'));
console.log('📁 dist folder exists:', distExists);

// Middleware
app.use(express.json());

// Serve static files from dist folder
if (distExists) {
  app.use(express.static(join(__dirname, 'dist')));
} else {
  console.warn('⚠️ dist folder not found. Run "npm run build" first.');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Fresher Hub',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Mock email service - no external connections
app.post('/api/send-otp', (req, res) => {
  console.log('📧 Mock OTP request:', req.body);
  
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }
    
    // Simulate email delay
    const delay = Math.floor(Math.random() * 1000) + 500;
    
    setTimeout(() => {
      console.log(`📨 Mock email sent to ${email}: ${otp}`);
      
      // Return mock response
      res.json({
        success: true,
        message: 'OTP generated (mock email service)',
        otp: otp,
        previewUrl: `https://example.com/preview/${Date.now()}`,
        note: 'On production, this would send real email. Use OTP above.',
        instructions: [
          '1. Copy the OTP from this response',
          '2. Go to /verify-otp page',
          '3. Enter the OTP to continue'
        ]
      });
    }, delay);
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message,
      otp: req.body?.otp || 'NOT_GENERATED'
    });
  }
});

// SPA fallback - serve index.html for all non-API routes
if (distExists) {
  try {
    const indexHtml = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf8');
    
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      // Skip static files (they have extensions)
      if (req.path.match(/\.[a-zA-Z0-9]+$/)) {
        return next();
      }
      // Serve index.html for SPA routing
      res.send(indexHtml);
    });
    
  } catch (err) {
    console.error('Error reading index.html:', err.message);
  }
} else {
  // Development fallback
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fresher Hub - Build Required</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
          .card { max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
          h1 { color: #667eea; }
          code { background: #f5f5f5; padding: 10px; border-radius: 5px; display: block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🚧 Build Required</h1>
          <p>Please run the build command first:</p>
          <code>npm run build</code>
          <p>Or if deploying on Render, ensure build command is set to:</p>
          <code>npm install && npm run build</code>
          <p>Then refresh this page.</p>
          <p><small>API endpoints are still available at /api/health and /api/send-otp</small></p>
        </div>
      </body>
      </html>
    `);
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📧 OTP API: POST http://localhost:${PORT}/api/send-otp`);
  console.log(`📝 Mock email service active (no external connections)`);
});