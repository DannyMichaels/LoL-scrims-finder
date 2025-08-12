o90# LoL Scrims Finder Project

## Project Overview

A web application for League of Legends players to find and organize scrimmage matches (scrims). The application includes user authentication, team management, and integration with Riot Games API.

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth with Riot OAuth integration
- **Frontend**: (To be determined based on your setup)

## Project Structure

```
lol-scrims-finder/
├── controllers/         # Route controllers
│   └── riot.auth.controllers.js  # Riot OAuth authentication
├── models/             # Database models
│   └── user.model.js   # User schema with Riot auth fields
├── routes/             # API routes
│   └── riot.auth.routes.js  # Riot authentication endpoints
├── services/           # Business logic and external services
│   └── riot.oauth.services.js  # Riot OAuth service layer
├── migrations/         # Database migrations
│   └── addRiotAuthFields.js  # Migration for Riot auth fields
└── server.js           # Main application entry point
```

## Key Features

- **Riot Sign-On (RSO) ONLY** - Google auth no longer supported
- Mandatory Riot Games account verification for all users
- Team creation and management
- Scrim scheduling and matchmaking
- Player profile with game statistics

## Environment Variables

The project uses a `.env` file for configuration:

- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `RIOT_CLIENT_ID` - Riot OAuth client ID
- `RIOT_CLIENT_SECRET` - Riot OAuth client secret
- `RIOT_REDIRECT_URI` - OAuth callback URL

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests (if configured)
npm test

# Lint code (if configured)
npm run lint
```

## API Endpoints

- `/api/auth/*` - Authentication routes
- `/api/riot-auth/*` - Riot OAuth routes
- `/api/users/*` - User management
- `/api/teams/*` - Team operations
- `/api/scrims/*` - Scrim scheduling

## Database Schema Updates

Recent additions include Riot authentication fields in the User model:

- `riotId` - Unique Riot account identifier
- `riotPuuid` - Player UUID from Riot
- `riotAccessToken` - OAuth access token
- `riotRefreshToken` - OAuth refresh token
- `summonerName` - In-game summoner name
- `tagLine` - Riot ID tag

## Current Development Status

- Riot OAuth (RSO) is MANDATORY - Google auth disabled
- All new users must sign up with Riot
- Existing Google users must migrate to Riot
- Migration is required (cannot be skipped)

## Notes for Development

- Always check git status before committing
- Main branch is `main` for PRs
- Current working branch is `rso` (Riot OAuth implementation)
- Remember to update environment variables when adding new integrations
- Follow existing code patterns in controllers and services
