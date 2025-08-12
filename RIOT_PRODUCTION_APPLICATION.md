# Riot Games Production API Key Application

## Email Template for Production Access Request

**Subject: Production API Key Request - LoL Scrims Finder (App ID: 586569)**

---

Dear Riot Games Developer Relations Team,

I am writing to request a Production API Key upgrade for my application, **Bootcamp LoL Scrim Gym** (App ID: 586569), which has been operating successfully with a development key since approval.

## Application Overview

**Bootcamp LoL Scrim Gym** is a web application designed to help the League of Legends community organize and manage custom scrimmage matches efficiently. Our platform eliminates the need for messy spreadsheets by providing a streamlined interface for hosting and joining scrims.

**Live Application**: https://lol-scrims-finder.netlify.app/

## Use Case Alignment

Our application aligns with several of Riot's approved use cases:

1. **Tournament Organization**: Players can create and manage custom lobbies with proper team composition
2. **LFG Tools**: Players can find and join scrims based on their rank and role preferences  
3. **Player Stats with Opt-in**: Display win rates and match history (with RSO verification)
4. **Training Tools**: Track personal performance across scrims to improve gameplay

## Key Features

### Current Implementation:
- **Scrim Management**: Admins create lobbies, players claim roles/teams
- **Automated Countdown**: Password and lobby details revealed at match start
- **Result Tracking**: Lobby captains report match outcomes
- **Player Profiles**: Win rate statistics, games played/casted tracking
- **Social Features**: Friend system for team building
- **Fair Play**: All players have equal access to join scrims

### Planned RSO Integration:
- **Verified Accounts**: Ensure all participants are real LoL players
- **Accurate Ranks**: Auto-fetch current rank from Riot API
- **Summoner Verification**: Prevent impersonation and smurfing
- **Opt-in Data Sharing**: Players explicitly consent to profile visibility

## Technical Implementation

We have already prepared our application for RSO integration:

### Backend Ready:
- OAuth 2.0 with PKCE implementation
- Secure token management
- User migration path from current auth system
- API endpoints for RSO callback handling

### Frontend Ready:
- Riot Sign-On UI components
- Migration flow for existing users
- Opt-in consent screens
- Profile completion after RSO authentication

### Security Measures:
- HTTPS/SSL for all API communications
- Server-side API key storage
- No client-side exposure of credentials
- Refresh token rotation

## Compliance Commitments

We commit to adhering to all Riot policies:

1. **Player Opt-in**: RSO integration will require explicit consent for data sharing
2. **Disclaimer**: Clear "Not affiliated with Riot Games" notice displayed
3. **Game Integrity**: No unfair advantages or game-altering features
4. **Monetization**: Free tier always available; any future premium features will be transformative
5. **Security**: API keys stored securely server-side only
6. **Fair Play**: No MMR calculators or hidden player analysis

## User Flow Documentation

### New User Registration:
1. User clicks "Sign in with Riot"
2. Redirected to Riot OAuth consent page
3. User approves data sharing
4. Return to app with verified summoner name
5. Complete profile with Discord and region
6. Access granted to scrim platform

### Existing User Migration:
1. Current users prompted to link Riot account
2. One-click migration preserves all data
3. Future logins use Riot Sign-On only

## Community Impact

- **Active Users**: Growing community of competitive players
- **Reduced Toxicity**: Verified accounts increase accountability
- **Better Matches**: Accurate ranks ensure balanced scrims
- **Tournament Ready**: Foundation for larger community events

## Development Team

- **Owner**: GitCat#NA1 (Riot Account)
- **Project URL**: https://lol-scrims-finder.netlify.app/
- **GitHub**: https://github.com/DannyMichaels/LoL-scrims-finder
- **Support Contact**: itzdanielmichael@gmail.com
- **Privacy Policy**: https://lol-scrims-finder.netlify.app/privacy-policy
- **Terms of Service**: https://lol-scrims-finder.netlify.app/terms-of-service

## Request

We respectfully request:
1. **Production API Key** upgrade for increased rate limits
2. **RSO Client Credentials** to implement Riot Sign-On
3. **Guidance** on any additional requirements for approval

We are committed to maintaining the highest standards of security, fair play, and positive player experience. Our application is ready for RSO integration immediately upon receiving production credentials.

Thank you for considering our application. We look forward to contributing to the League of Legends community with official Riot integration.

Best regards,
Daniel Michael
Lead Developer
Bootcamp LoL Scrim Gym Team

---

## Attachments to Include:

1. **Screenshots** of current application UI
2. **User flow diagrams** showing RSO integration
3. **Technical architecture** diagram
4. **Privacy Policy** URL: https://lol-scrims-finder.netlify.app/privacy-policy
5. **Terms of Service** URL: https://lol-scrims-finder.netlify.app/terms-of-service

---

## Quick Response Template for Follow-up Questions:

### If asked about monetization:
"We currently operate as a free service. Any future monetization would follow Riot's guidelines: free tier maintained, only transformative features premium, no gambling/betting, and tournament entry fees with 70% to prize pool."

### If asked about data handling:
"Player data is only displayed after explicit opt-in via RSO. We store minimal data (PUUID, summoner name, rank) and never share with third parties. Users can request data deletion at any time."

### If asked about scale:
"We're prepared to handle growth with scalable cloud infrastructure. Rate limiting is implemented to respect API limits. We can provide metrics on current usage if needed."

### If asked about timeline:
"Our RSO integration is fully developed and tested in staging. We can deploy within 24 hours of receiving production credentials."