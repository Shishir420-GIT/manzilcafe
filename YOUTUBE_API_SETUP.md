# YouTube API Setup Guide for ManzilCafe Focus Room

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Select a project" dropdown at the top
   - Click "New Project"
   - Enter project name: "ManzilCafe-YouTube"
   - Click "Create"

## Step 2: Enable YouTube Data API

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

2. **Enable YouTube IFrame API**
   - Search for "YouTube IFrame Player API"
   - Click on it and press "Enable"

## Step 3: Create API Credentials

1. **Go to Credentials**
   - Click "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

2. **Restrict API Key (Recommended)**
   - Click on the API key you just created
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add your domains:
       - `http://localhost:5173/*` (for development)
       - `https://your-domain.com/*` (for production)
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose "YouTube Data API v3"
   - Click "Save"

## Step 4: Add API Key to Environment

1. **Update .env file**
   ```env
   # Add this line to your .env file
   VITE_YOUTUBE_API_KEY=your_api_key_here
   ```

2. **Update .env.example**
   ```env
   # YouTube API Configuration
   VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

## Step 5: Set Up OAuth (Optional - for Login)

1. **Create OAuth 2.0 Client ID**
   - In Credentials, click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:5173` (development)
     - `https://your-domain.com` (production)
   - Add authorized redirect URIs:
     - `http://localhost:5173/auth/youtube/callback`
     - `https://your-domain.com/auth/youtube/callback`

2. **Add OAuth credentials to .env**
   ```env
   VITE_YOUTUBE_CLIENT_ID=your_client_id_here
   VITE_YOUTUBE_CLIENT_SECRET=your_client_secret_here
   ```

## Step 6: Test the Integration

1. **Restart your development server**
   ```bash
   npm run dev
   ```

2. **Test YouTube functionality**
   - Go to Focus Room
   - Try playing music
   - Check browser console for any errors

## API Usage Limits

- **Free Tier**: 10,000 units per day
- **Search**: 100 units per request
- **Video details**: 1 unit per request
- **Playlist items**: 1 unit per request

## Troubleshooting

### Common Issues:

1. **"API key not valid"**
   - Check if API key is correct in .env
   - Ensure YouTube Data API v3 is enabled
   - Check API key restrictions

2. **"Referer not allowed"**
   - Add your domain to API key restrictions
   - Include both HTTP and HTTPS versions

3. **"Quota exceeded"**
   - You've hit the daily limit
   - Wait 24 hours or upgrade to paid plan

4. **Videos not playing**
   - Check if videos are embeddable
   - Some videos have embedding restrictions
   - Try different video IDs

### Testing API Key:

Test your API key with this URL:
```
https://www.googleapis.com/youtube/v3/search?part=snippet&q=lofi&type=video&key=YOUR_API_KEY
```

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables**
3. **Restrict API key usage**
4. **Monitor API usage in Google Cloud Console**
5. **Rotate keys regularly**

## Cost Considerations

- **Free tier** is usually sufficient for small apps
- **Monitor usage** in Google Cloud Console
- **Implement caching** to reduce API calls
- **Consider paid plan** for high-traffic apps

Your YouTube integration should now work! The Focus Room will be able to play YouTube music with proper API authentication.