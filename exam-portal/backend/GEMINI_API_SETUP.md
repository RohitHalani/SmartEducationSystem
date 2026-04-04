# 🤖 Gemini AI Chatbot Setup Guide

## Overview

The Exam Portal chatbot now uses Google's Gemini AI API for intelligent, context-aware responses. This guide will help you set up and configure the Gemini API integration.

## Features

✅ **Smart AI Responses**: Context-aware answers using Google's Gemini Pro model
✅ **Automatic Fallback**: Falls back to keyword-based responses if API is unavailable
✅ **User Role Awareness**: Provides different responses based on student/faculty role
✅ **Educational Context**: Trained to help with study materials, PYQs, and portal features
✅ **Error Handling**: Graceful error handling with informative messages

## Prerequisites

- Node.js installed (v14 or higher)
- Google Cloud account (free tier available)
- Exam Portal backend already set up

## Step-by-Step Setup

### Step 1: Get Your Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Or go to: https://aistudio.google.com/

2. **Sign in with your Google Account**
   - Use any Google account (personal or work)

3. **Create an API Key**
   - Click on "Get API Key" or "Create API Key"
   - Select "Create API key in new project" (or use existing project)
   - Copy the generated API key
   - **Important**: Keep this key secure and never share it publicly!

4. **API Key Format**
   - Your API key will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 2: Configure the Backend

1. **Open the `.env` file**
   - Location: `exam-portal/backend/.env`
   - If it doesn't exist, create it

2. **Add your Gemini API Key**
   ```env
   MONGODB_URI=mongodb://localhost:27017/exam-portal
   JWT_SECRET=exam-portal-dev-secret
   PORT=5000
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Replace the placeholder**
   - Replace `your_gemini_api_key_here` with your actual API key
   - Make sure there are no spaces or quotes around the key

### Step 3: Install Dependencies (if not already done)

```bash
cd exam-portal/backend
npm install
```

The `@google/generative-ai` package should already be installed. If not:

```bash
npm install @google/generative-ai
```

### Step 4: Start the Server

```bash
npm start
```

**Expected Output:**
```
========================================
🚀 Exam Portal Backend Server Started!
========================================
📍 Server running on: http://localhost:5000
✅ MongoDB Connected: localhost:27017
✅ Using MONGODB storage
========================================
```

### Step 5: Test the Chatbot

1. **Open the frontend** (http://localhost:3000)
2. **Login or Register** a user account
3. **Click the chatbot icon** (bottom right corner)
4. **Try asking questions** like:
   - "How do I find notes for Data Structures?"
   - "Where can I download PYQ papers?"
   - "Help me prepare for exams"
   - "What materials are available?"

## How It Works

### Gemini API Integration

1. **User sends a message** through the chatbot
2. **Backend creates a context-aware prompt** that includes:
   - Portal information (Exam Buddy features)
   - User role (student/faculty)
   - User's question
   - Instructions for helpful responses

3. **Gemini AI processes the prompt** and generates an intelligent response
4. **Response is sent back** to the user
5. **Chat history is saved** in MongoDB

### Fallback Mechanism

If the Gemini API is unavailable (no API key, quota exceeded, network error):
- The system automatically falls back to **keyword-based responses**
- Users still get helpful answers for common questions
- No error messages are shown to users
- The chatbot continues to function normally

## API Usage and Limits

### Free Tier Limits (as of 2024)

- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per day**

These limits are generous for development and small-scale projects.

### Check Your Usage

1. Go to Google AI Studio: https://aistudio.google.com/
2. Click on "API Keys" in the sidebar
3. View your usage statistics

## Troubleshooting

### Issue: "Gemini API key not configured"

**Solution:**
- Check that `GEMINI_API_KEY` is set in `.env`
- Make sure the API key is not `your_gemini_api_key_here`
- Restart the backend server after changing `.env`

### Issue: "API key is invalid"

**Solution:**
- Verify your API key is correct (copy again from Google AI Studio)
- Make sure there are no extra spaces or line breaks
- Check that the API key starts with `AIza`

### Issue: "Quota exceeded"

**Solution:**
- You've hit the daily/minute limit
- Wait for the quota to reset (check Google AI Studio)
- The chatbot will use fallback responses automatically

### Issue: Chatbot not responding intelligently

**Check:**
1. Is the API key configured correctly?
2. Check backend terminal for errors
3. Open browser console (F12) and check for errors
4. Try restarting the backend server

**Debug Steps:**
```bash
# Check if API key is loaded
cd backend
node -e "require('dotenv').config(); console.log(process.env.GEMINI_API_KEY)"
```

### Issue: "Failed to fetch" or network errors

**Solution:**
- Check your internet connection
- Verify Google AI Studio services are running
- Check if your firewall is blocking the requests

## Testing Without API Key

The chatbot will work without a Gemini API key by using fallback responses. To test:

1. **Remove or comment out the API key** in `.env`:
   ```env
   # GEMINI_API_KEY=your_key_here
   ```

2. **Restart the server**
3. **Test the chatbot** - it will use keyword-based responses

## Advanced Configuration

### Change the AI Model

Edit `backend/uploads/server.js` line 425:

```javascript
// Use Gemini Pro (default)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Or use Gemini Pro Vision (for image understanding)
const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
```

### Customize the System Prompt

Edit the prompt in `backend/uploads/server.js` (lines 428-441) to change how the AI responds:

```javascript
const prompt = `You are an AI study assistant for an educational portal called "Exam Buddy".
[Customize this message to change AI behavior]
`;
```

### Add Conversation History

To make the chatbot remember previous messages in the conversation, you can:

1. Fetch recent chat history from the database
2. Include it in the prompt
3. Send it to Gemini for context-aware responses

## Security Best Practices

🔒 **Never commit your API key to Git**
- Add `.env` to `.gitignore`
- Use environment variables in production

🔒 **Keep your API key secure**
- Don't share it publicly
- Don't expose it in client-side code
- Rotate keys if compromised

🔒 **Monitor API usage**
- Check Google AI Studio regularly
- Set up usage alerts
- Implement rate limiting on your backend

## Production Deployment

When deploying to production:

1. **Use environment variables** on your hosting platform:
   - Heroku: `heroku config:set GEMINI_API_KEY=your_key`
   - Vercel: Add to project environment variables
   - AWS: Use AWS Secrets Manager

2. **Enable rate limiting** to prevent abuse
3. **Monitor costs** and usage
4. **Set up error logging** (e.g., Sentry, LogRocket)

## Additional Resources

- **Google AI Studio**: https://aistudio.google.com/
- **Gemini API Documentation**: https://ai.google.dev/docs
- **API Reference**: https://ai.google.dev/api/rest
- **Node.js SDK**: https://www.npmjs.com/package/@google/generative-ai

## Support

If you encounter issues:

1. Check this guide first
2. Review the troubleshooting section
3. Check backend terminal logs
4. Check browser console (F12)
5. Verify your API key is valid

## Summary

✅ Get API key from Google AI Studio
✅ Add `GEMINI_API_KEY` to `.env`
✅ Install dependencies (`npm install`)
✅ Start the server (`npm start`)
✅ Test the chatbot
✅ Monitor usage and costs

**The chatbot is now powered by Google's Gemini AI!** 🚀
