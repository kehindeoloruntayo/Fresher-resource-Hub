// server.js
import express from 'express';
import { Resend } from 'resend';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Debug endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    resendConfigured: !!process.env.RESEND_API_KEY 
  });
});

app.post('/send-otp', async (req, res) => {
 
  
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Fresher Hub <onboarding@resend.dev>',
      to: [email],
      subject: 'Password Reset OTP - Fresher Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body>
          <h2>Password Reset OTP</h2>
          <p>Your OTP code is: <strong>${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return res.status(500).json({ 
        error: 'Failed to send OTP', 
        details: error.message 
      });
    }

    console.log('✅ Email sent successfully:', data?.id);
    res.status(200).json({ 
      message: 'OTP sent successfully', 
      emailId: data?.id 
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      error: 'Failed to send OTP', 
      details: error.message 
    });
  }
});

app.post('/send-reset-confirmation', async (req, res) => {
  try {
    const { email } = req.body;

    const { data, error } = await resend.emails.send({
      from: 'Fresher Hub <onboarding@resend.dev>',
      to: [email],
      subject: 'Password Successfully Reset - Fresher Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">✅ Password Successfully Reset</h2>
          <p>Hello,</p>
          <p>Your Fresher Hub password has been successfully reset.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
        </div>
      `
    });

    if (error) throw error;
    res.status(200).json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Error sending confirmation:', error);
    res.status(500).json({ error: 'Failed to send confirmation email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Health check: http://localhost:${PORT}/health`);
});