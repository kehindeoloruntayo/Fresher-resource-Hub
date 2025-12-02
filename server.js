
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

app.use(express.json());

// Serve static files from dist folder
if (distExists) {
  app.use(express.static(join(__dirname, 'dist')));
  console.log('✅ Serving static files from dist/');
}


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


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Fresher Hub',
    timestamp: new Date().toISOString(),
    email: !!transporter
  });
});


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
        
      }
    }
    
    
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


const handleSPA = (req, res, next) => {
  
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  
  if (req.path.match(/\.[a-zA-Z0-9]{2,}$/)) {
    return next();
  }
  
  
  if (indexHtml) {
    return res.send(indexHtml);
  }
  
  
  next();
};

app.use(handleSPA);

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



const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Email configured: ${transporter ? '✅ Yes' : '❌ No (using mock)'}`);
  console.log(`📁 SPA routing: ${indexHtml ? '✅ Enabled' : '❌ Disabled'}`);
});