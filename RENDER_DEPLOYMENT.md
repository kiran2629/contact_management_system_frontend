# Render Static Site Deployment Guide

## Overview

This guide explains how to deploy the frontend as a static site on Render.

## Production URL

- **Frontend**: https://crm-b7wf.onrender.com/

## Deployment Steps

### 1. Build Configuration

The project is configured to build for production with:

- Base path: `/` (root)
- Output directory: `dist`
- Static assets in `assets/` folder

### 2. Build Command

```bash
npm run build
```

This will create a `dist` folder with all production files.

### 3. Render Static Site Setup

1. **Create a new Static Site on Render**

   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your repository

2. **Configure Build Settings**

   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: `Production`

3. **Environment Variables**
   Add these in Render's environment variables section:

   ```
   VITE_API_URL=https://your-backend-api-url.com
   ```

   **Important**: Replace with your actual backend API URL

4. **Routing Configuration**
   - The `public/_redirects` file is automatically copied to `dist/` during build
   - This file tells Render to serve `index.html` for all routes (SPA routing)
   - Format: `/*    /index.html   200`

### 4. Important Files

- **`public/_redirects`**: Handles client-side routing (prevents 404 on refresh)
- **`.env.production`**: Production environment variables (create this file locally)
- **`vite.config.ts`**: Build configuration

### 5. Troubleshooting

#### Issue: "Page Not Found" on refresh

**Solution**: Ensure `public/_redirects` file exists with:

```
/*    /index.html   200
```

#### Issue: Assets not loading

**Solution**:

- Check that `base: "/"` is set in `vite.config.ts`
- Verify build output in `dist` folder
- Check browser console for 404 errors

#### Issue: API calls failing

**Solution**:

- Verify `VITE_API_URL` is set correctly in Render's environment variables
- Check CORS settings on backend
- Ensure backend API is accessible from the frontend domain

### 6. Build Output Structure

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── favicon.ico
├── favicon.svg
└── _redirects
```

### 7. Testing Production Build Locally

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

Visit `http://localhost:4173` to test the production build locally.

### 8. Deployment Checklist

- [ ] `.env.production` file created with correct `VITE_API_URL`
- [ ] `public/_redirects` file exists
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables set in Render dashboard
- [ ] Test navigation and page refreshes
- [ ] Test API connectivity
- [ ] Verify all routes work correctly

## Notes

- The `_redirects` file is essential for React Router to work correctly on static hosting
- All routes (like `/dashboard`, `/contacts`, etc.) will be served by `index.html`
- React Router handles the client-side routing after the page loads
- Environment variables must be set in Render's dashboard, not in `.env.production` (that file is for local builds)
