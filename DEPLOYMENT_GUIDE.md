# 🚀 **ManzilCafe 2.0 - Netlify Deployment Guide**

## **Prerequisites**

Before deploying, ensure you have:
- ✅ **Supabase Project** configured with all tables and RLS policies
- ✅ **Google Cloud Project** with Gemini API enabled
- ✅ **Environment Variables** ready for production

## **Step 1: Environment Variables Setup**

### **Required Environment Variables for Netlify:**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### **How to Get These Values:**

#### **Supabase Configuration:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon public** key

#### **Google Gemini API:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

## **Step 2: Deploy to Netlify**

### **Option A: Deploy via Netlify UI (Recommended)**

1. **Go to [Netlify](https://netlify.com)** and sign in
2. **Click "Add new site"** → **"Deploy manually"**
3. **Drag and drop** the `dist` folder from your project
4. **Configure environment variables:**
   - Go to **Site settings** → **Environment variables**
   - Add the three environment variables listed above
5. **Deploy!**

### **Option B: Deploy via Git (Continuous Deployment)**

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect your GitHub repository
   - Set build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

3. **Add Environment Variables:**
   - Go to **Site settings** → **Environment variables**
   - Add the three environment variables

4. **Deploy!**

## **Step 3: Post-Deployment Configuration**

### **1. Update Supabase Auth Settings**
1. Go to your Supabase project
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Netlify domain to **Site URL**
4. Add your Netlify domain to **Redirect URLs**

### **2. Update Google OAuth Settings**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add your Netlify domain to **Authorized JavaScript origins**
5. Add your Netlify domain to **Authorized redirect URIs**

### **3. Test Your Deployment**
1. **Test Authentication**: Try signing in with Google
2. **Test AI Features**: Try chatting with the bartender
3. **Test Real-time Features**: Test chat and voice features
4. **Test File Access**: Visit `/robots.txt` and `/llm.txt`

## **Step 4: Custom Domain (Optional)**

### **Add Custom Domain:**
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the DNS configuration instructions
4. Update your Supabase and Google OAuth settings with the new domain

## **Step 5: Monitoring & Maintenance**

### **Monitor Your Site:**
- **Netlify Analytics**: View site performance
- **Supabase Dashboard**: Monitor database usage
- **Google Cloud Console**: Monitor API usage

### **Environment Variables in Netlify:**
1. Go to **Site settings** → **Environment variables**
2. Add/update variables as needed
3. Redeploy after changes

## **Troubleshooting**

### **Common Issues:**

#### **1. Environment Variables Not Working**
- Ensure variables are named exactly as shown above
- Redeploy after adding environment variables
- Check Netlify build logs for errors

#### **2. Authentication Not Working**
- Verify Supabase URL configuration
- Check redirect URLs in Supabase and Google Cloud
- Ensure HTTPS is enabled

#### **3. AI Features Not Working**
- Verify Gemini API key is correct
- Check API usage limits
- Review browser console for errors

#### **4. Real-time Features Not Working**
- Verify Supabase real-time is enabled
- Check network connectivity
- Review browser console for errors

## **Security Checklist**

### **Pre-Deployment:**
- ✅ Environment variables are secure
- ✅ API keys are properly configured
- ✅ CORS settings are correct
- ✅ Security headers are configured

### **Post-Deployment:**
- ✅ HTTPS is enabled
- ✅ Authentication works
- ✅ AI features are secure
- ✅ Rate limiting is active

## **Performance Optimization**

### **Build Optimization:**
- The build process creates optimized files
- Assets are minified and compressed
- Code splitting is implemented

### **Runtime Optimization:**
- Real-time features are efficient
- AI responses are cached
- Voice processing is optimized

## **Support & Maintenance**

### **Regular Maintenance:**
- Monitor API usage
- Update dependencies regularly
- Review security settings
- Backup database regularly

### **Getting Help:**
- Check Netlify documentation
- Review Supabase documentation
- Consult Google Cloud documentation
- Check browser console for errors

## **🎉 Success!**

Your ManzilCafe 2.0 application is now deployed and ready for users!

**Live URL**: Your Netlify domain
**Status**: 🟢 **Production Ready**
**Security**: 🛡️ **Enterprise Grade**
**Features**: ✅ **All Implemented**

Enjoy your virtual café! ☕ 