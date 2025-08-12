// utils
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const escape = require('escape-html');
const { REGIONS } = require('../utils/constants');
const KEYS = require('../config/keys');
const { unbanUser, banDateExpired } = require('../utils/adminUtils');
const { validateRank, checkSummonerNameValid, validateSummonerTagline, validateDiscordUsername } = require('../utils/validators');
const { removeSpacesBeforeHashTag } = require('../utils/discord');
const { createLoginHistory } = require('../services/createLoginHistory.services');

// models
const User = require('../models/user.model');
const Ban = require('../models/ban.model');

// Riot OAuth services
const riotOAuth = require('../services/riot.oauth.services');

require('dotenv').config();

// Check if new users should use Riot SSO only
const checkAuthMethod = async (req, res) => {
  try {
    // Always require Riot SSO
    res.json({ 
      useRiotAuth: true,
      migrationRequired: true 
    });
  } catch (error) {
    console.error('Error checking auth method:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Initialize Riot OAuth flow
const initRiotLogin = async (req, res) => {
  try {
    const { verifier, challenge } = riotOAuth.generatePKCE();
    const state = riotOAuth.generateState();
    
    // Store PKCE verifier with state as key
    riotOAuth.storePKCE(state, verifier);
    
    // Build authorization URL
    const authUrl = riotOAuth.getAuthorizationUrl(state, challenge);
    
    res.json({ authUrl, state });
  } catch (error) {
    console.error('Error initializing Riot login:', error);
    res.status(500).json({ error: 'Failed to initialize Riot login' });
  }
};

// Handle Riot OAuth callback
const handleRiotCallback = async (req, res) => {
  const { code, state, error: authError } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
  
  if (authError) {
    console.error('Riot auth error:', authError);
    return res.redirect(`${clientUrl}/signup?error=${authError}`);
  }
  
  // Retrieve PKCE verifier
  const codeVerifier = riotOAuth.retrievePKCE(state);
  if (!codeVerifier) {
    console.error('Invalid state - PKCE verifier not found');
    return res.redirect(`${clientUrl}/signup?error=invalid_state`);
  }
  
  try {
    // Exchange code for tokens
    const tokens = await riotOAuth.exchangeCodeForTokens(code, codeVerifier);
    
    // Get user information from Riot
    const [userInfo, riotAccount] = await Promise.all([
      riotOAuth.getUserInfo(tokens.access_token),
      riotOAuth.getRiotAccount(tokens.access_token, riotOAuth.mapRegionToRouting(req.query.region))
    ]);
    
    if (!riotAccount) {
      console.error('Failed to get Riot account data');
      return res.redirect(`${clientUrl}/signup?error=riot_account_error`);
    }
    
    // Get platform from userInfo (cpid)
    const platform = riotOAuth.mapRegionToPlatform(userInfo.cpid);
    
    // Get summoner data if available
    const summonerData = await riotOAuth.getSummonerByPUUID(riotAccount.puuid, platform);
    
    // Get ranked data if summoner exists
    let rank = 'Unranked';
    if (summonerData) {
      rank = await riotOAuth.getRankedData(summonerData.id, platform);
    }
    
    // Check if user exists with this PUUID
    let user = await User.findOne({ 'riotAuth.puuid': riotAccount.puuid });
    
    if (!user) {
      // Check if this is a Google user trying to migrate (same game name)
      const existingGoogleUser = await User.findOne({
        name: riotAccount.gameName,
        authProvider: 'google'
      });
      
      if (existingGoogleUser) {
        // This is a migration scenario - create a link token
        const linkToken = jwt.sign(
          {
            googleUserId: existingGoogleUser._id,
            riotData: {
              puuid: riotAccount.puuid,
              accountId: userInfo.sub,
              gameName: riotAccount.gameName,
              tagLine: riotAccount.tagLine,
              summonerId: summonerData?.id,
              profileIconId: summonerData?.profileIconId,
              summonerLevel: summonerData?.summonerLevel,
              refreshToken: tokens.refresh_token
            },
            tokens
          },
          KEYS.SECRET_OR_KEY,
          { expiresIn: '10m' }
        );
        
        // Redirect to account linking page
        return res.redirect(`${clientUrl}/link-accounts?token=${linkToken}`);
      }
      
      // This is a brand new user - redirect to signup completion
      const signupToken = jwt.sign(
        {
          riotData: {
            puuid: riotAccount.puuid,
            accountId: userInfo.sub,
            gameName: riotAccount.gameName,
            tagLine: riotAccount.tagLine,
            summonerId: summonerData?.id,
            profileIconId: summonerData?.profileIconId,
            summonerLevel: summonerData?.summonerLevel,
            rank: rank.split(' ')[0] || 'Unranked',
            region: userInfo.cpid?.toUpperCase() || 'NA',
            refreshToken: tokens.refresh_token
          }
        },
        KEYS.SECRET_OR_KEY,
        { expiresIn: '10m' }
      );
      
      return res.redirect(`${clientUrl}/complete-signup?token=${signupToken}`);
    } else {
      // Existing Riot user - log them in
      
      // Check if user is banned
      if (user.currentBan?.isActive) {
        if (banDateExpired(user.currentBan.dateTo)) {
          await unbanUser(user);
        } else {
          const foundBan = user.currentBan?._ban 
            ? await Ban.findById(user.currentBan._ban)
            : null;
          
          return res.redirect(
            `${clientUrl}/signup?error=banned&until=${user.currentBan.dateTo}`
          );
        }
      }
      
      // Update user's Riot data
      user.riotAuth.lastUpdated = new Date();
      if (summonerData) {
        user.riotAuth.summonerLevel = summonerData.summonerLevel;
        user.riotAuth.profileIconId = summonerData.profileIconId;
      }
      user.rank = rank.split(' ')[0] || user.rank;
      user.riotAuth.refreshToken = tokens.refresh_token;
      user.lastLoggedIn = Date.now();
      
      // Create login history
      if (process.env.NODE_ENV === 'production') {
        try {
          await createLoginHistory(req, user);
        } catch (error) {
          console.error('Failed to create login history:', error);
        }
      }
      
      await user.save();
      
      // Generate JWT for session
      const payload = {
        uid: user.riotAuth.puuid, // Use PUUID as uid for Riot users
        email: user.email,
        rank: user.rank,
        _id: user._id,
        region: user.region,
        discord: user.discord,
        adminKey: user.adminKey,
        isAdmin: user.adminKey === KEYS.ADMIN_KEY,
        name: user.name,
        summonerTagline: user.summonerTagline,
        notifications: user.notifications,
        friendRequests: user.friendRequests,
        friends: user.friends,
        authProvider: 'riot',
        canSendEmailsToUser: user.canSendEmailsToUser ?? false
      };
      
      const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
        expiresIn: KEYS.JWT_EXPIRATION
      });
      
      // Redirect with token
      res.redirect(`${clientUrl}/auth-success?token=${encodeURIComponent(accessToken)}`);
    }
    
  } catch (error) {
    console.error('Riot OAuth callback error:', error);
    res.redirect(`${clientUrl}/signup?error=auth_failed`);
  }
};

// Complete Riot signup (for new users)
const completeRiotSignup = async (req, res) => {
  const { token, discord, region } = req.body;
  
  try {
    // Verify signup token
    const decoded = jwt.verify(token, KEYS.SECRET_OR_KEY);
    const { riotData } = decoded;
    
    if (!riotData) {
      return res.status(400).json({ error: 'Invalid signup token' });
    }
    
    // Validate discord
    const noSpacesDiscord = removeSpacesBeforeHashTag(discord);
    if (!validateDiscordUsername(noSpacesDiscord)) {
      return res.status(400).json({ error: 'Invalid Discord username format' });
    }
    
    // Check if Discord is taken
    const discordTaken = await User.findOne({
      discord: { $regex: `^${noSpacesDiscord}$`, $options: 'i' }
    });
    
    if (discordTaken) {
      return res.status(400).json({
        error: `Discord username ${discord} is already taken`
      });
    }
    
    // Validate region
    const upperRegion = region?.toUpperCase();
    if (!REGIONS.includes(upperRegion)) {
      return res.status(400).json({ error: 'Invalid region' });
    }
    
    // Create new user
    const newUser = new User({
      authProvider: 'riot',
      name: riotData.gameName,
      summonerTagline: riotData.tagLine,
      discord: noSpacesDiscord,
      rank: riotData.rank,
      region: upperRegion,
      email: `${riotData.puuid}@riot.local`, // Placeholder email for Riot users
      riotAuth: {
        puuid: riotData.puuid,
        accountId: riotData.accountId,
        summonerId: riotData.summonerId,
        profileIconId: riotData.profileIconId,
        summonerLevel: riotData.summonerLevel,
        lastUpdated: new Date(),
        refreshToken: riotData.refreshToken
      },
      lastLoggedIn: Date.now()
    });
    
    await newUser.save();
    
    // Generate JWT for session
    const payload = {
      uid: newUser.riotAuth.puuid,
      email: newUser.email,
      rank: newUser.rank,
      _id: newUser._id,
      region: newUser.region,
      discord: newUser.discord,
      adminKey: newUser.adminKey || '',
      isAdmin: false,
      name: newUser.name,
      summonerTagline: newUser.summonerTagline,
      notifications: [],
      friendRequests: [],
      friends: [],
      authProvider: 'riot',
      canSendEmailsToUser: false
    };
    
    const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
      expiresIn: KEYS.JWT_EXPIRATION
    });
    
    res.status(201).json({
      success: true,
      token: `Bearer ${accessToken}`,
      user: newUser
    });
    
  } catch (error) {
    console.error('Complete signup error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Link Google account with Riot account
const linkAccounts = async (req, res) => {
  const { token } = req.body;
  
  try {
    // Verify link token
    const decoded = jwt.verify(token, KEYS.SECRET_OR_KEY);
    const { googleUserId, riotData } = decoded;
    
    // Find the Google user
    const user = await User.findById(googleUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is already migrated
    if (user.authProvider === 'riot') {
      return res.status(400).json({ error: 'User already migrated to Riot' });
    }
    
    // Update user with Riot data
    user.authProvider = 'riot';
    user.name = riotData.gameName; // Update to Riot game name
    user.summonerTagline = riotData.tagLine;
    user.riotAuth = {
      puuid: riotData.puuid,
      accountId: riotData.accountId,
      summonerId: riotData.summonerId,
      profileIconId: riotData.profileIconId,
      summonerLevel: riotData.summonerLevel,
      lastUpdated: new Date(),
      refreshToken: riotData.refreshToken
    };
    user.migrationStatus = {
      status: 'completed',
      completedAt: new Date()
    };
    
    await user.save();
    
    // Generate new JWT with updated data
    const payload = {
      uid: user.riotAuth.puuid, // Now use PUUID as uid
      email: user.email,
      rank: user.rank,
      _id: user._id,
      region: user.region,
      discord: user.discord,
      adminKey: user.adminKey,
      isAdmin: user.adminKey === KEYS.ADMIN_KEY,
      name: user.name,
      summonerTagline: user.summonerTagline,
      notifications: user.notifications,
      friendRequests: user.friendRequests,
      friends: user.friends,
      authProvider: 'riot',
      canSendEmailsToUser: user.canSendEmailsToUser ?? false
    };
    
    const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
      expiresIn: KEYS.JWT_EXPIRATION
    });
    
    res.json({
      success: true,
      token: `Bearer ${accessToken}`,
      user
    });
    
  } catch (error) {
    console.error('Account linking error:', error);
    res.status(400).json({ error: 'Failed to link accounts' });
  }
};

// Check migration status for current user
const checkMigrationStatus = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.json({ needsMigration: false });
    }
    
    const user = await User.findById(userId);
    
    if (!user || user.authProvider !== 'google') {
      return res.json({ needsMigration: false });
    }
    
    // Always require migration for Google users
    res.json({
      needsMigration: true,
      migrationStatus: user.migrationStatus.status,
      forceMigration: true,
      canSkip: false
    });
  } catch (error) {
    console.error('Error checking migration status:', error);
    res.status(500).json({ error: 'Failed to check migration status' });
  }
};

// Skip migration temporarily - no longer allowed
const skipMigration = async (req, res) => {
  // Migration cannot be skipped anymore
  return res.status(403).json({ 
    error: 'Migration cannot be skipped',
    message: 'Google authentication is no longer supported. You must migrate to Riot Sign-On to continue.'
  });
};

// Refresh Riot access token
const refreshRiotToken = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await User.findById(userId);
    
    if (!user || user.authProvider !== 'riot' || !user.riotAuth?.refreshToken) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    
    // Refresh the token
    const tokens = await riotOAuth.refreshAccessToken(user.riotAuth.refreshToken);
    
    // Update refresh token if provided
    if (tokens.refresh_token) {
      user.riotAuth.refreshToken = tokens.refresh_token;
      await user.save();
    }
    
    res.json({ 
      success: true,
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in
    });
  } catch (error) {
    console.error('Error refreshing Riot token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};

module.exports = {
  checkAuthMethod,
  initRiotLogin,
  handleRiotCallback,
  completeRiotSignup,
  linkAccounts,
  checkMigrationStatus,
  skipMigration,
  refreshRiotToken
};