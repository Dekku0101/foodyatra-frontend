# Backend Connection Setup Guide

## ✅ What's Been Done

1. **API Service Created** (`src/lib/api.ts`)
   - Handles all backend API calls
   - Manages authentication tokens
   - Provides functions for auth, recommendations, and preferences

2. **LoginCard Updated**
   - Now connects to your backend API
   - Supports both Login and Signup
   - Shows toast notifications for success/errors

3. **Dashboard Page Created**
   - Protected route that shows user info
   - Logout functionality

## 🔧 Setup Steps

### Step 1: Create Environment File

Create a `.env` file in the `FRONTEND` directory with:

```env
VITE_API_URL=http://localhost:5000/api
```

**Important:** If your backend runs on a different port, update the URL accordingly.

### Step 2: Start Your Backend Server

Make sure your backend is running:

```bash
cd ../BACKEND
npm start
# or
npm run dev
```

Your backend should be running on `http://localhost:5000`

### Step 3: Start Your Frontend

```bash
cd FRONTEND
npm run dev
```

Your frontend will run on `http://localhost:5173` (or the port shown in terminal)

## 🧪 Testing the Connection

1. **Test Signup:**
   - Go to `http://localhost:5173`
   - Click "Sign Up" tab
   - Enter name, email, and password
   - Click "Create Account"
   - You should see a success message

2. **Test Login:**
   - After signup, switch to "Login" tab
   - Enter your email and password
   - Click "Start Your Food Journey"
   - You should be redirected to `/dashboard`

3. **Test Logout:**
   - Click "Logout" button in the dashboard
   - You should be redirected back to the login page

## 🔍 Troubleshooting

### "Network error" or "Failed to fetch"
- Make sure your backend server is running
- Check that the backend URL in `.env` matches your backend port
- Check browser console (F12) for detailed error messages

### "Invalid email or password"
- Make sure you're using the correct credentials
- Check if the user exists in your backend database

### CORS Errors
- Your backend should have CORS enabled (it does in `app.js`)
- If you still see CORS errors, check your backend CORS configuration

## 📝 API Endpoints Used

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

## 🔐 Token Management

- Tokens are stored in `localStorage` with key `"token"`
- Token is automatically included in API requests via `Authorization: Bearer <token>` header
- Token is removed on logout

## 🚀 Next Steps

You can now:
- Add more API endpoints for recommendations
- Implement user preferences
- Add protected routes
- Customize the Dashboard UI


