# Lancer Multi-User Authentication Setup

This document provides instructions for setting up the multi-user authentication system with Google SAML login for the Lancer application.

## Overview

The application has been updated to support multi-user functionality with the following features:
- Google OAuth 2.0 authentication
- JWT token-based authorization
- User-specific data isolation
- Secure login/logout functionality

## Backend Setup

### 1. Database Migration

The database schema has been updated to include user relationships. You'll need to delete the existing database and let it recreate with the new schema:

```bash
cd backend-csharp/LancerApi
rm lancer.db
dotnet run
```

### 2. JWT Configuration

Update the JWT settings in `appsettings.json`:

```json
{
  "Jwt": {
    "Key": "your-super-secret-key-that-should-be-at-least-32-characters-long-and-secure",
    "Issuer": "LancerApi",
    "Audience": "LancerApp"
  }
}
```

**Important**: Replace the JWT key with a secure, randomly generated key for production.

### 3. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Configure the authorized origins:
   - For development: `http://localhost:3000`
   - For production: Your domain
6. Copy the Client ID for frontend configuration

## Frontend Setup

### 1. Environment Configuration

Update `frontend/.env.local` with your Google Client ID:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-google-client-id-here
```

### 2. Install Dependencies

Make sure all dependencies are installed:

```bash
cd frontend
npm install
```

## Running the Application

### 1. Start the Backend

```bash
cd backend-csharp/LancerApi
dotnet run
```

The API will be available at `http://localhost:5000`

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Authentication Flow

1. **Login**: Users are redirected to `/login` if not authenticated
2. **Google OAuth**: Users sign in with their Google account
3. **JWT Token**: Backend generates a JWT token for the authenticated user
4. **User Creation**: New users are automatically created in the database
5. **Data Isolation**: All API endpoints now filter data by the authenticated user's ID

## API Changes

All API endpoints now require authentication and automatically filter data by user:

### Authentication Headers

All requests (except login) must include the JWT token:

```javascript
Authorization: Bearer <jwt-token>
```

### User-Specific Data

- Artists, customers, orders, products, and artist bases are now user-specific
- Each entity includes a `UserId` field that links it to the authenticated user
- API endpoints automatically filter results by the current user's ID

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Google OAuth**: Leverages Google's secure authentication system
3. **User Isolation**: Complete data separation between users
4. **Automatic Token Refresh**: Frontend handles token expiration
5. **Secure Logout**: Proper cleanup of authentication state

## Development Notes

### Database Schema Changes

The following models have been updated with user relationships:
- `Artist` - Added `UserId` foreign key
- `Customer` - Added `UserId` foreign key
- `Order` - Added `UserId` foreign key
- `Product` - Added `UserId` foreign key
- `ArtistBase` - Added `UserId` foreign key

### New Components

- `AuthContext` - React context for authentication state
- `ProtectedRoute` - Component to protect authenticated routes
- `LoginPage` - Google OAuth login interface
- `AuthService` - Backend service for user management
- `AuthController` - API endpoints for authentication

### API Client

The frontend includes a comprehensive API client (`utils/api.js`) that:
- Automatically includes authentication headers
- Handles token expiration and redirects
- Provides typed API methods for all endpoints

## Troubleshooting

### Common Issues

1. **Google Client ID not working**
   - Verify the Client ID is correct in `.env.local`
   - Check that the domain is authorized in Google Cloud Console

2. **JWT Token errors**
   - Ensure the JWT key is at least 32 characters long
   - Verify the key matches between development and production

3. **Database errors**
   - Delete the existing `lancer.db` file and restart the backend
   - Check that Entity Framework migrations are applied

4. **CORS issues**
   - Verify the frontend URL is allowed in the backend CORS policy
   - Check that the API URL is correct in frontend configuration

### Testing Authentication

1. Navigate to `http://localhost:3000`
2. You should be redirected to `/login`
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. You should be redirected back to the main application
6. Your user info should appear in the sidebar

## Production Deployment

### Security Checklist

- [ ] Generate a secure JWT key (32+ characters)
- [ ] Configure Google OAuth for production domain
- [ ] Use HTTPS for all communications
- [ ] Set up proper CORS policies
- [ ] Configure secure cookie settings
- [ ] Set up database backups
- [ ] Monitor authentication logs

### Environment Variables

Ensure these are set in production:
- `NEXT_PUBLIC_API_URL` - Your production API URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Your production Google Client ID
- Backend JWT configuration in `appsettings.json`

## Support

For issues or questions about the authentication system, please refer to:
- Google OAuth documentation
- ASP.NET Core Identity documentation
- Next.js authentication patterns
