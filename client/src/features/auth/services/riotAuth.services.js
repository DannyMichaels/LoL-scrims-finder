import api from '@/services/apiConfig';
import jwt_decode from 'jwt-decode';
import { setAuthToken } from './auth.services';

// Check if Riot SSO is required
export const checkAuthMethod = async () => {
  try {
    const response = await api.get('/auth/check-method');
    return response.data;
  } catch (error) {
    console.error('Error checking auth method:', error);
    return { useRiotAuth: true, migrationRequired: true }; // Default to Riot
  }
};

// Initialize Riot OAuth flow
export const initRiotLogin = async () => {
  try {
    const response = await api.get('/auth/riot/init');
    return response.data;
  } catch (error) {
    console.error('Error initializing Riot login:', error);
    throw error;
  }
};

// Complete signup for new Riot users
export const completeRiotSignup = async (token, additionalData) => {
  try {
    const response = await api.post('/auth/riot/complete-signup', {
      token,
      ...additionalData
    });

    if (response.data?.token) {
      const { token } = response.data;
      localStorage.setItem('jwtToken', token);
      setAuthToken(token);
      const decodedUser = jwt_decode(token);
      return { user: decodedUser, success: true };
    }
    
    throw new Error('No token received');
  } catch (error) {
    console.error('Complete signup error:', error);
    throw error;
  }
};

// Link Google account with Riot account
export const linkAccounts = async (linkToken) => {
  try {
    const response = await api.post('/auth/riot/link-accounts', {
      token: linkToken
    });

    if (response.data?.token) {
      const { token } = response.data;
      localStorage.setItem('jwtToken', token);
      setAuthToken(token);
      const decodedUser = jwt_decode(token);
      return { user: decodedUser, success: true };
    }
    
    throw new Error('Account linking failed');
  } catch (error) {
    console.error('Account linking error:', error);
    throw error;
  }
};

// Check migration status
export const checkMigrationStatus = async () => {
  try {
    const response = await api.get('/auth/migration-status');
    return response.data;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return { needsMigration: false };
  }
};

// Login existing Riot user (after OAuth callback)
export const loginRiotUser = async (token) => {
  try {
    localStorage.setItem('jwtToken', token);
    setAuthToken(token);
    const decodedUser = jwt_decode(token);
    return decodedUser;
  } catch (error) {
    console.error('Error logging in Riot user:', error);
    throw error;
  }
};