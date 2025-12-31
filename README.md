# Mailuto - Email Automation Made Simple

A modern, lightweight SaaS application for scheduling and automating personalized email reminders.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google
- 👥 **Subscriber Management** - Add and manage recipients with service details
- 📧 **Smart Templates** - Create reusable email templates with dynamic variables
- 📅 **Flexible Scheduling** - Set up monthly or custom interval automations
- 🎨 **Modern UI** - Mobile-first, responsive design with smooth animations
- 🔒 **Secure** - User data isolation and input validation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Email**: Resend API
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)
- Google OAuth credentials
- Resend API key

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mailuto?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Resend Email API
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local` file

### Setting Up Resend

1. Sign up at [Resend](https://resend.com/)
2. Get your API key from the dashboard
3. Add your API key to `.env.local`
4. Verify your domain or use the provided test email for development

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Add the output to `NEXTAUTH_SECRET` in `.env.local`

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mailuto/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── subscribers/  # Subscriber CRUD
│   │   ├── templates/    # Template CRUD
│   │   └── schedules/    # Schedule CRUD
│   ├── dashboard/        # Protected dashboard pages
│   │   ├── subscribers/
│   │   ├── templates/
│   │   └── schedules/
│   ├── layout.tsx
│   ├── page.tsx          # Landing page
│   └── globals.css
├── components/
│   ├── dashboard/        # Dashboard components
│   ├── subscribers/      # Subscriber components
│   ├── templates/        # Template components
│   ├── schedules/        # Schedule components
│   └── providers/        # Context providers
├── lib/
│   ├── db.ts            # MongoDB connection
│   └── email.ts         # Email service
├── models/              # Mongoose models
│   ├── User.ts
│   ├── Subscriber.ts
│   ├── Template.ts
│   └── Schedule.ts
├── scripts/
│   └── send-scheduled-emails.js  # Cron job script
├── types/
│   └── next-auth.d.ts   # Type definitions
├── auth.ts              # NextAuth configuration
├── middleware.ts        # Route protection
└── package.json
```

## Template Variables

The following variables can be used in email templates:

- `{{name}}` - Subscriber's name
- `{{email}}` - Subscriber's email
- `{{service}}` - Service name
- `{{nextDate}}` - Next scheduled send date

Example template:

```
Subject: Your {{service}} renewal is coming up

Hi {{name}},

This is a friendly reminder that your {{service}} subscription is due for renewal on {{nextDate}}.

Best regards
```

## Automation

To run scheduled emails automatically, set up a cron job:

```bash
# Run every hour
0 * * * * cd /path/to/mailuto && npm run cron
```

Or use a service like:
- **Vercel Cron Jobs** (recommended for Vercel deployments)
- **GitHub Actions**
- **Cron-job.org**

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Vercel Cron Setup

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/send-emails",
    "schedule": "0 * * * *"
  }]
}
```

## Security Features

- ✅ Google OAuth only (no password management)
- ✅ User data isolation (users can only access their own data)
- ✅ Input validation with Zod
- ✅ Template variable whitelisting
- ✅ Protected API routes
- ✅ Middleware-based route protection

## Features Roadmap

- [ ] Email analytics and tracking
- [ ] Rich text editor for templates
- [ ] Bulk subscriber import (CSV)
- [ ] Custom variables
- [ ] Team collaboration
- [ ] Webhook integrations

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and MongoDB
