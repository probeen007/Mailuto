# Development Checklist

## 🏁 Before First Run

- [ ] Run `npm install` (already done ✅)
- [ ] Copy `.env.local.template` to `.env.local`
- [ ] Set up MongoDB (see below)
- [ ] Configure Google OAuth (see below)
- [ ] Get Resend API key (see below)
- [ ] Generate NEXTAUTH_SECRET

## 🗄️ MongoDB Setup

- [ ] Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Create a free cluster (M0)
- [ ] Create database user (username + password)
- [ ] Whitelist IP: 0.0.0.0/0 (for development)
- [ ] Get connection string
- [ ] Replace `<password>` in connection string
- [ ] Add to `.env.local` as `MONGODB_URI`

## 🔐 Google OAuth Setup

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project or select existing
- [ ] Enable "Google+ API"
- [ ] Go to Credentials → Create OAuth 2.0 Client ID
- [ ] Set Application type: "Web application"
- [ ] Add Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Copy Client ID → `.env.local` as `GOOGLE_CLIENT_ID`
- [ ] Copy Client Secret → `.env.local` as `GOOGLE_CLIENT_SECRET`

## 📧 Resend Setup

- [ ] Sign up at [Resend](https://resend.com/)
- [ ] Get API key from dashboard
- [ ] Add to `.env.local` as `RESEND_API_KEY`
- [ ] For dev: use `FROM_EMAIL=onboarding@resend.dev`
- [ ] For production: verify your domain in Resend

## 🔑 NextAuth Secret

Run in terminal:
```bash
openssl rand -base64 32
```

- [ ] Copy output to `.env.local` as `NEXTAUTH_SECRET`

## ✅ Environment Variables Checklist

Your `.env.local` should have:

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
RESEND_API_KEY=re_...
FROM_EMAIL=onboarding@resend.dev
```

## 🚀 First Run

- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Click "Sign in with Google"
- [ ] Verify redirect to dashboard after login

## 🧪 Feature Testing

### Test Subscribers
- [ ] Add a subscriber with your email
- [ ] Edit the subscriber
- [ ] Search for subscriber
- [ ] Delete subscriber (then re-add for next tests)

### Test Templates
- [ ] Create template with variables
- [ ] Preview template with sample data
- [ ] Edit template
- [ ] Delete template (then re-create for next test)

### Test Schedules
- [ ] Create a schedule (monthly)
- [ ] Create a schedule (interval)
- [ ] Pause/resume schedule
- [ ] Delete schedule

### Test Email Sending (Optional)
- [ ] Create subscriber with your real email
- [ ] Create simple test template
- [ ] Create schedule with next send date = today
- [ ] Run: `npm run cron`
- [ ] Check your email inbox

## 🌐 Production Deployment

### Pre-Deployment
- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Import GitHub repository

### Vercel Configuration
- [ ] Add all environment variables in Vercel
- [ ] Update `NEXTAUTH_URL` to production URL (e.g., `https://mailuto.vercel.app`)
- [ ] Update Google OAuth redirect URI to production URL
- [ ] Deploy!

### Post-Deployment
- [ ] Test login on production
- [ ] Test all CRUD operations
- [ ] Verify cron job runs (check Vercel logs)
- [ ] Verify emails are being sent

## 🎨 Customization (Optional)

- [ ] Update app name in [layout.tsx](app/layout.tsx)
- [ ] Customize colors in [tailwind.config.ts](tailwind.config.ts)
- [ ] Update landing page content in [app/page.tsx](app/page.tsx)
- [ ] Add your logo/branding
- [ ] Customize email templates

## 📝 Documentation

All documentation is ready:
- ✅ README.md - Full project documentation
- ✅ SETUP.md - Quick setup guide
- ✅ PROJECT_SUMMARY.md - Implementation details
- ✅ This checklist - Step-by-step tasks

## 🆘 Troubleshooting

### Can't connect to MongoDB
- Verify connection string format
- Check username/password (no special characters issues)
- Ensure IP is whitelisted in MongoDB Atlas

### Google OAuth fails
- Verify redirect URI matches exactly
- Check Client ID/Secret are correct
- Ensure Google+ API is enabled

### Emails not sending
- Verify Resend API key
- Check Resend dashboard for errors
- For production, verify domain

### Build errors
- Run `npm install` again
- Delete `node_modules` and `.next`, then reinstall
- Check TypeScript errors with `npm run build`

---

## ✨ You're All Set!

Once you complete this checklist, your Mailuto app will be fully functional and ready for users!

🎉 Happy coding!
