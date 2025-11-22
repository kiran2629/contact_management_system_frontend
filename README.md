# Contact Management System - Frontend

## 🚀 Production Deployment

### Frontend Production URL

- **Live URL**: https://crm-b7wf.onrender.com/

### Environment Configuration

This project uses environment variables for API configuration. See `ENV_SETUP.md` for detailed setup instructions.

**Quick Setup:**

1. **Development** - Create `.env` file:

   ```env
   VITE_API_URL=http://localhost:5000
   ```

2. **Production** - Create `.env.production` file:
   ```env
   VITE_API_URL=<your-backend-api-url>
   ```

**Important:** `VITE_API_URL` should point to your **backend API server**, not the frontend URL.

For more details, see:

- `ENV_SETUP.md` - Environment variables setup guide
- `QUICK_START.md` - Quick start guide

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

## 🏗️ Build for Production

```bash
npm run build
```

## 📚 Documentation

- `QUICK_START.md` - Quick start guide
- `ENV_SETUP.md` - Environment variables setup
- `QUICK_REFERENCE.md` - Quick reference guide
