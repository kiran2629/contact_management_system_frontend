# Environment Variables Setup

## Production Configuration

### Frontend Production URL
- **Frontend**: https://crm-b7wf.onrender.com/

### Backend API URL
The `VITE_API_URL` environment variable should point to your **backend API server**, not the frontend URL.

### Setup Instructions

1. **For Production Build:**
   Create a `.env.production` file in the root directory:

   ```env
   # Production Environment Variables
   # Frontend Production URL: https://crm-b7wf.onrender.com/
   # Backend API URL: Update this with your actual backend API URL
   VITE_API_URL=https://crmnodeapi.onrender.com
   ```

2. **For Development:**
   Create a `.env` file in the root directory:

   ```env
   # Development Environment Variables
   VITE_API_URL=http://localhost:5000
   ```

### Important Notes

- `.env` is used for local development (`npm run dev`)
- `.env.production` is automatically used when building for production (`npm run build`)
- `VITE_API_URL` should point to your **backend API server**, not the frontend URL
- If your backend API is on the same domain as the frontend, you may need to use a different path or subdomain

### Example Configurations

**If backend is on same domain:**
```env
VITE_API_URL=https://crm-b7wf.onrender.com
```

**If backend is on different domain:**
```env
VITE_API_URL=https://crmnodeapi.onrender.com
```

**If backend uses a different path:**
```env
VITE_API_URL=https://crm-b7wf.onrender.com/api
```

