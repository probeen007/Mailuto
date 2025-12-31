# External Cron Setup Guide

This app uses an **external cron service** to trigger scheduled email sending. This is **FREE** and works perfectly with Vercel's serverless architecture.

## 🎯 Why External Cron?

- ✅ **100% Free** - No need for Vercel Pro plan ($20/month)
- ✅ **Reliable** - Dedicated cron services are more reliable than serverless cron
- ✅ **Flexible** - Easy to change schedule or providers
- ✅ **Monitoring** - Most services provide execution logs and alerts

## 🚀 Quick Setup (5 minutes)

### Step 1: Deploy to Vercel

1. Push your code to GitHub
2. Deploy to Vercel (it will automatically detect Next.js)
3. Copy your production URL: `https://your-app.vercel.app`

### Step 2: Set Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these required variables:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
FROM_EMAIL=your-email@yourdomain.com

# NextAuth
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cron Security (IMPORTANT!)
CRON_SECRET=create-a-strong-random-password-here
```

**Important:** Generate a strong random string for `CRON_SECRET`:
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Step 3: Choose a Free Cron Service

#### Option A: cron-job.org (Recommended) ⭐

1. **Sign up**: https://cron-job.org/en/signup.php
2. **Create a new cron job**:
   - **Title**: Mailuto Email Sender
   - **URL**: `https://your-app.vercel.app/api/cron/send-emails`
   - **Schedule**: Every hour (`0 * * * *`)
   - **Request Method**: GET
   - **Custom Headers**: 
     - Header: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET_HERE`
3. **Enable notifications**: Get email alerts if cron fails
4. **Save and enable**

#### Option B: EasyCron (Alternative)

1. **Sign up**: https://www.easycron.com/user/register
2. **Add Cron Job**:
   - **URL**: `https://your-app.vercel.app/api/cron/send-emails`
   - **Cron Expression**: `0 * * * *` (every hour)
   - **HTTP Headers**: `Authorization: Bearer YOUR_CRON_SECRET_HERE`
3. **Enable and save**

#### Option C: UptimeRobot (Bonus: Also monitors uptime!)

1. **Sign up**: https://uptimerobot.com/signUp
2. **Add New Monitor**:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Mailuto Cron
   - **URL**: `https://your-app.vercel.app/api/cron/send-emails`
   - **Monitoring Interval**: 60 minutes
   - **Custom HTTP Headers**: `Authorization: Bearer YOUR_CRON_SECRET_HERE`
3. **Create Monitor**

### Step 4: Test the Setup

#### Test 1: Manual API Call

```bash
# Replace with your actual URL and CRON_SECRET
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/send-emails
```

Expected response:
```json
{
  "message": "Cron job completed",
  "processed": 0,
  "results": []
}
```

#### Test 2: Check Cron Service Logs

- Wait for the next scheduled run (within an hour)
- Check your cron service dashboard for execution logs
- Verify status is "Success" (200 response)

#### Test 3: Create a Test Schedule

1. Log into your app
2. Create a subscriber
3. Create a template
4. Create a schedule with `nextSendDate` set to now or past
5. Wait for next cron run (or trigger manually)
6. Check if email was sent

## 🔒 Security

The cron endpoint is protected by `CRON_SECRET`:

- **Without CRON_SECRET**: Anyone can trigger the endpoint (NOT recommended for production)
- **With CRON_SECRET**: Only requests with valid Bearer token can trigger emails

**Always set CRON_SECRET in production!**

## 📊 Monitoring

### Check Cron Execution

1. **Cron Service Dashboard**: Shows when jobs ran and their status
2. **Vercel Logs**: See detailed execution logs
   - Go to: Vercel Dashboard → Your Project → Functions
3. **Email Service**: Check Resend dashboard for sent emails

### Common Issues

#### Issue: 401 Unauthorized
**Cause**: Wrong or missing CRON_SECRET  
**Fix**: Check that the Authorization header matches exactly: `Bearer YOUR_CRON_SECRET`

#### Issue: 500 Internal Server Error
**Cause**: Database connection or other errors  
**Fix**: Check Vercel logs for detailed error messages

#### Issue: Emails not sending
**Cause**: Invalid Resend API key or FROM_EMAIL  
**Fix**: Verify RESEND_API_KEY and FROM_EMAIL in Vercel settings

#### Issue: Schedules not found
**Cause**: No schedules with due dates  
**Fix**: Create a schedule with `nextSendDate` in the past or present

## ⚙️ Advanced Configuration

### Change Schedule Frequency

Edit your cron service to run more or less frequently:

- **Every 30 minutes**: `*/30 * * * *`
- **Every hour**: `0 * * * *` (recommended)
- **Every 6 hours**: `0 */6 * * *`
- **Daily at 9 AM**: `0 9 * * *`

### Batch Size Limit

The cron job processes maximum 100 schedules per run to avoid timeouts.
If you have more, they'll be processed in the next run.

### Timeout Protection

The cron job has built-in safeguards:
- **Max duration**: 60 seconds (for Vercel Pro/Enterprise)
- **Batch limit**: 100 schedules per run
- **Skip old schedules**: Schedules older than 24 hours are skipped to prevent loops

## 🆘 Troubleshooting

### Test locally:

```bash
# Set environment variables in .env.local
npm run dev

# In another terminal, trigger cron manually:
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/send-emails
```

### Enable debug logging:

Check Vercel Function logs for detailed information about each execution.

## 📝 Summary

1. ✅ Deploy to Vercel with all environment variables
2. ✅ Set CRON_SECRET for security
3. ✅ Sign up for a free cron service (cron-job.org recommended)
4. ✅ Configure cron to call your API endpoint every hour
5. ✅ Add Authorization header with Bearer token
6. ✅ Test and monitor

**Your automated email system is now fully functional and FREE!** 🎉
