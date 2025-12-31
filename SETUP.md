# Mailuto - Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment Variables

1. Copy the template file:
```bash
copy .env.local.template .env.local
```

2. Fill in the values in `.env.local`:

#### MongoDB Setup
- Free option: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string
- Replace username and password

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret

#### Resend Setup
1. Sign up at [Resend](https://resend.com/)
2. Get your API key from dashboard
3. For development, use `onboarding@resend.dev` as FROM_EMAIL

#### Generate NextAuth Secret
```bash
openssl rand -base64 32
```

### Step 3: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: Test the Application

1. **Sign in** with Google
2. **Add a subscriber** (name, email, service)
3. **Create a template** using variables like `{{name}}`, `{{service}}`
4. **Set up a schedule** to automate emails
5. **Test the cron job** (optional):
   ```bash
   npm run cron
   ```

## 📱 Usage Flow

1. **Landing Page** → Sign in with Google
2. **Dashboard** → Overview and quick actions
3. **Subscribers** → Add/Edit recipients
4. **Templates** → Create email templates with variables
5. **Schedules** → Set up automation

## 🎨 Template Variables

Available variables:
- `{{name}}` - Subscriber's name
- `{{email}}` - Subscriber's email
- `{{service}}` - Service name (e.g., "Netflix Premium")
- `{{nextDate}}` - Next scheduled email date

## 📅 Scheduling Options

- **Monthly**: Send on a specific day each month (1-31)
- **Interval**: Send every N days (e.g., every 30 days)

## 🔧 Troubleshooting

### "Failed to connect to MongoDB"
- Check your MONGODB_URI
- Ensure IP is whitelisted in MongoDB Atlas
- Verify username/password

### "Google OAuth not working"
- Verify redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- Check Client ID and Secret are correct
- Make sure Google+ API is enabled

### "Email not sending"
- Verify RESEND_API_KEY is correct
- For production, verify your domain in Resend
- Check logs in Resend dashboard

## 🚀 Deployment to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables
4. Update NEXTAUTH_URL to your production URL
5. Update Google OAuth redirect URI to production URL
6. Deploy!

### Enable Automatic Email Sending

The app includes Vercel Cron configuration (`vercel.json`) that runs hourly.
No additional setup needed on Vercel!

## 📚 Next Steps

- Customize the landing page
- Add your branding/colors in `tailwind.config.ts`
- Create your first email templates
- Invite users to test

## 🆘 Need Help?

Check the [README.md](README.md) for detailed documentation.

---

Happy automating! 🎉
