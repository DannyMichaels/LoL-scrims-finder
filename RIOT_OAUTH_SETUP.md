# Riot OAuth (RSO) Implementation Guide

## Overview
This application now supports Riot Sign-On (RSO) authentication, allowing League of Legends players to authenticate using their Riot accounts. This ensures that users are real LoL players and provides access to their game data.

## Features Implemented

### 1. Dual Authentication Support
- **New Users**: Must sign up using Riot SSO (configurable via `FORCE_RIOT_SSO_FOR_NEW_USERS`)
- **Existing Google Users**: Can continue using Google auth with migration prompts
- **Migration Path**: Smooth transition from Google to Riot authentication

### 2. PKCE Implementation
- Secure OAuth2 flow with PKCE (Proof Key for Code Exchange)
- State parameter for CSRF protection
- Temporary storage of PKCE verifiers

### 3. User Data Integration
- Fetches player's PUUID, game name, and tag line
- Retrieves summoner level and profile icon
- Gets ranked data (tier and division)
- Stores refresh tokens for long-lived sessions

## Setup Instructions

### Prerequisites
1. **Production API Access from Riot Games**
   - Apply for production access at https://developer.riotgames.com
   - This process can take 3-4 months
   - Must demonstrate legitimate use case

2. **RSO Client Registration**
   - Once approved, you'll receive an invitation to register an RSO client
   - Required: Company name, logo, privacy policy URL, terms of service URL

### Environment Configuration
Add these variables to your `.env` file:

```env
# Riot OAuth Configuration
RIOT_CLIENT_ID=your-riot-client-id
RIOT_CLIENT_SECRET=your-riot-client-secret
RIOT_REDIRECT_URI=http://localhost:3000/api/auth/riot/callback

# Riot API Key (for fetching game data)
RIOT_API_KEY=RGAPI-your-api-key

# Migration Settings
FORCE_RIOT_SSO_FOR_NEW_USERS=true
MIGRATION_GRACE_PERIOD_DAYS=30
```

## API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/auth/check-method` - Check if Riot SSO is required
- `GET /api/auth/riot/init` - Initialize Riot OAuth flow
- `GET /api/auth/riot/callback` - OAuth callback handler
- `POST /api/auth/riot/complete-signup` - Complete signup for new Riot users
- `POST /api/auth/riot/link-accounts` - Link Google account with Riot

### Protected Endpoints (Auth Required)
- `GET /api/auth/migration-status` - Check migration status
- `POST /api/auth/skip-migration` - Temporarily skip migration (7 days)
- `POST /api/auth/riot/refresh-token` - Refresh Riot access token

## Authentication Flow

### New User Registration
1. User clicks "Sign up with Riot"
2. Frontend calls `/api/auth/riot/init` to get authorization URL
3. User is redirected to Riot's auth page
4. After login, Riot redirects to `/api/auth/riot/callback`
5. Backend exchanges code for tokens and fetches user data
6. New users are redirected to complete signup (add Discord, select region)
7. Account is created with Riot authentication

### Existing User Login
1. User clicks "Login with Riot"
2. Same OAuth flow as registration
3. If PUUID exists in database, user is logged in
4. JWT is generated and sent to frontend

### Google User Migration
1. Google user logs in normally
2. System checks if migration is needed
3. If grace period expired, user sees migration prompt
4. User initiates Riot OAuth flow
5. System links Riot account to existing profile
6. User's auth provider is updated to 'riot'

## Frontend Integration

### Initiating Riot Login
```javascript
// Start Riot OAuth flow
const response = await fetch('/api/auth/riot/init');
const { authUrl } = await response.json();
window.location.href = authUrl;
```

### Handling Callback
```javascript
// On /auth-success page
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
  // Store token and redirect to dashboard
  localStorage.setItem('token', token);
  window.location.href = '/dashboard';
}
```

### Checking Migration Status
```javascript
// Check if current user needs migration
const response = await fetch('/api/auth/migration-status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { needsMigration, daysRemaining } = await response.json();
```

## Security Considerations

1. **PKCE is Mandatory**: All clients must implement PKCE
2. **HTTPS Required**: Production redirect URIs must use HTTPS
3. **Token Storage**: Store tokens securely (httpOnly cookies recommended)
4. **Refresh Tokens**: Encrypted and stored in database
5. **State Validation**: CSRF protection via state parameter

## Migration Strategy

### Phase 1: Soft Launch (Current)
- New users required to use Riot SSO
- Existing users see migration prompts
- 30-day grace period for migration
- Users can skip migration for 7 days at a time

### Phase 2: Enforcement
- After grace period, Google users must migrate
- Critical routes blocked until migration complete
- Non-critical routes show warnings

### Phase 3: Deprecation
- Remove Google OAuth entirely
- All users on Riot SSO
- Simplified authentication flow

## Troubleshooting

### Common Issues

1. **"Invalid state" error**
   - PKCE verifier expired (10-minute timeout)
   - User took too long to complete auth

2. **"Failed to get Riot account" error**
   - Missing or invalid RIOT_API_KEY
   - API rate limits exceeded

3. **Migration not working**
   - Check FORCE_RIOT_SSO_FOR_NEW_USERS setting
   - Verify grace period configuration

### Debug Mode
Enable debug logging:
```javascript
// In services/riot.oauth.services.js
console.log('OAuth State:', state);
console.log('PKCE Verifier:', verifier);
console.log('Token Response:', tokens);
```

## Testing

### Local Testing
1. Set up local redirect URI in Riot developer portal
2. Use `http://localhost:3000/api/auth/riot/callback`
3. Test with real Riot account

### Test Scenarios
- New user registration with Riot
- Existing Riot user login
- Google user migration flow
- Token refresh
- Migration skip functionality

## Support

For issues or questions:
- Check Riot API documentation: https://developer.riotgames.com
- Review OAuth2 PKCE spec: RFC 7636
- Contact Riot developer support for API issues