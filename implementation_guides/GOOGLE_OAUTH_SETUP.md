# Google OAuth Setup for Manziil Café

This guide will help you set up Google OAuth authentication in your Supabase project.

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add your authorized redirect URIs:
   - Use the Supabase-provided callback URL: `https://vjbquihgtaidulipdvac.supabase.co/auth/v1/callback`
8. Copy the Client ID and Client Secret

## Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "Providers"
3. Find "Google" in the list and click "Edit"
4. Enable Google provider
5. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
6. Save the configuration

## Step 3: Update Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Click "Join Now" on the homepage
3. Click "Continue with Google" in the auth modal
4. Complete the Google OAuth flow
5. You should be redirected back to the app and signed in

## Troubleshooting

### Common Issues:

1. **Redirect URI mismatch**: Make sure the redirect URI in Google Cloud Console matches exactly with your Supabase callback URL
2. **CORS errors**: Ensure your domain is properly configured in Google Cloud Console
3. **Supabase configuration**: Double-check that Google provider is enabled in Supabase dashboard

### Development vs Production:

- **All environments**: Use the Supabase-provided callback URL: `https://vjbquihgtaidulipdvac.supabase.co/auth/v1/callback`

## Security Notes

- Never commit your Google OAuth credentials to version control
- Use environment variables for sensitive configuration
- Regularly rotate your OAuth credentials
- Monitor your OAuth usage in Google Cloud Console

## Additional Providers

You can add more OAuth providers (GitHub, Discord, etc.) following the same pattern:

1. Configure the provider in Supabase dashboard
2. Add the provider button to the AuthModal component
3. Handle the OAuth flow with `supabase.auth.signInWithOAuth()` 