# 🔧 Vercel Environment Variables Setup

## 📋 Required Environment Variables

Your Vercel deployment needs these environment variables to work properly:

### **1. Supabase Configuration**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🚀 How to Add Environment Variables in Vercel

### **Method 1: Vercel Dashboard (Recommended)**

1. **Go to your Vercel project dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `stepv-nextjs`

2. **Navigate to Settings**
   - Click on **"Settings"** tab
   - Click on **"Environment Variables"** in the sidebar

3. **Add Variables**
   - Click **"Add New"**
   - Add each variable:
     ```
     Name: NEXT_PUBLIC_SUPABASE_URL
     Value: https://eqriodcmakvwbjcbbegu.supabase.co
     Environment: Production, Preview, Development
     ```
     
     ```
     Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
     Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcmlvZGNtYWt2d2JqY2JiZWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTE0MDcsImV4cCI6MjA3MDIyNzQwN30.WtDgsMjEDF0BykiZrUq-AAJ3ZJy6UrbnijnuwbIntk4
     Environment: Production, Preview, Development
     ```

4. **Save and Redeploy**
   - Click **"Save"**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on the latest deployment

### **Method 2: Vercel CLI**

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://eqriodcmakvwbjcbbegu.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcmlvZGNtYWt2d2JqY2JiZWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTE0MDcsImV4cCI6MjA3MDIyNzQwN30.WtDgsMjEDF0BykiZrUq-AAJ3ZJy6UrbnijnuwbIntk4

# Redeploy
vercel --prod
```

## ✅ Verification

After adding environment variables:

1. **Check Deployment Logs**
   - Go to Vercel dashboard → Deployments
   - Click on latest deployment
   - Check build logs for any environment variable errors

2. **Test Dashboard Page**
   - Visit: https://dohystudio.com/dashboard
   - Should load without "supabaseUrl is required" error

3. **Check Browser Console**
   - Open developer tools
   - Look for Supabase connection messages
   - Should see "✅ Supabase configured" instead of warnings

## 🔍 Troubleshooting

### **If deployment still fails:**

1. **Double-check variable names** (case-sensitive)
2. **Ensure all environments are selected** (Production, Preview, Development)
3. **Verify values don't have extra spaces**
4. **Try redeploying after adding variables**

### **Common Issues:**

- ❌ **Variable name typos**: `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
- ❌ **Missing NEXT_PUBLIC_ prefix**: Required for client-side access
- ❌ **Wrong environment selection**: Must include "Production"
- ❌ **Cached deployment**: Need to redeploy after adding variables

## 📞 Support

If you continue having issues:
1. Check Vercel deployment logs
2. Verify environment variables in Vercel dashboard
3. Test locally with same environment variables
4. Contact Vercel support if needed
