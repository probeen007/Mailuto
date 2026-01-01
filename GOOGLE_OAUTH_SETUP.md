# Fix Google OAuth redirect_uri_mismatch Error

## Error 400: redirect_uri_mismatch

This error means your Google OAuth redirect URI doesn't match what's configured in Google Cloud Console.

## Steps to Fix:

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### 2. Select Your Project
Choose the project where you created your OAuth credentials

### 3. Click on Your OAuth 2.0 Client ID
Find your OAuth client in the list and click on it

### 4. Add Authorized Redirect URIs

Add BOTH of these URLs:

**For Production (Vercel):**
```
https://mailuto.vercel.app/api/auth/callback/google
```

**For Local Development:**
```
http://localhost:3000/api/auth/callback/google
```

### 5. Save Changes
Click "Save" at the bottom

### 6. Wait 5 Minutes
Google OAuth changes can take a few minutes to propagate

### 7. Verify Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Make sure these are set:
```
NEXTAUTH_URL=https://mailuto.vercel.app
NEXTAUTH_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-secret>
MONGODB_URI=<your-mongodb-uri>
```

### 8. Redeploy on Vercel
```bash
git add .
git commit -m "fix: remove duplicate indexes and add force-dynamic"
git push
```

## Common Issues:

- **Wrong domain**: Make sure it's `mailuto.vercel.app` not `mailuto-xyz.vercel.app`
- **Missing /api/auth/callback/google**: The path must be exact
- **HTTP vs HTTPS**: Production must use `https://`
- **Trailing slash**: Don't add trailing slashes

## Test After Fix:

1. Go to https://mailuto.vercel.app
2. Click "Sign in with Google"
3. Should redirect properly without error 400

## Still Having Issues?

Check the actual redirect URI being used:
- Look at the browser URL when you get the error
- Copy the exact `redirect_uri` from the error message
- Add that exact URI to Google Cloud Console
