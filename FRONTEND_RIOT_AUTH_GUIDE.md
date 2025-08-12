# Frontend Implementation Guide for Riot OAuth

## Overview
This guide shows how to implement the frontend for Riot Sign-On (RSO) authentication.

## 1. Login/Signup Page Changes

### Remove Google Auth UI
Remove all Google sign-in buttons and replace with Riot SSO.

### Login Component Example (React)
```jsx
import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRiotLogin = async () => {
    try {
      setLoading(true);
      
      // Get the Riot OAuth URL from backend
      const response = await axios.get('/api/auth/riot/init', {
        headers: {
          'X-API-KEY': 'your-api-key' // Use your X_API_KEY
        }
      });
      
      const { authUrl } = response.data;
      
      // Redirect to Riot's login page
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to initialize login');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>LoL Scrims Finder</h1>
      <p>Sign in with your Riot account to verify you're a League player</p>
      
      <button 
        onClick={handleRiotLogin}
        disabled={loading}
        className="riot-login-btn"
      >
        {loading ? 'Redirecting...' : 'Sign in with Riot'}
      </button>
      
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

## 2. OAuth Callback Handler

Create a page to handle the OAuth callback (`/auth-success` or similar):

```jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setError(`Authentication failed: ${error}`);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (token) {
      // Store the JWT token
      localStorage.setItem('token', token);
      
      // Decode token to get user info (optional)
      const payload = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem('user', JSON.stringify(payload));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      setError('No token received');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="auth-callback">
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <p>Authenticating... Please wait.</p>
      )}
    </div>
  );
};
```

## 3. Complete Signup Page (for new Riot users)

After Riot auth, new users need to provide additional info:

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const CompleteSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    discord: '',
    region: 'NA'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const regions = ['NA', 'EUW', 'EUNE', 'KR', 'BR', 'LAN', 'LAS', 'OCE', 'TR', 'RU', 'JP'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/auth/riot/complete-signup', {
        token,
        discord: formData.discord,
        region: formData.region
      }, {
        headers: {
          'X-API-KEY': 'your-api-key'
        }
      });

      // Store the JWT token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
      setLoading(false);
    }
  };

  if (!token) {
    return <div>Invalid signup token. Please try logging in again.</div>;
  }

  return (
    <div className="complete-signup">
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Discord Username (with #tag)</label>
          <input
            type="text"
            value={formData.discord}
            onChange={(e) => setFormData({...formData, discord: e.target.value})}
            placeholder="YourName#1234"
            required
            pattern="^.{3,32}#[0-9]{4}$"
          />
        </div>

        <div className="form-group">
          <label>Region</label>
          <select
            value={formData.region}
            onChange={(e) => setFormData({...formData, region: e.target.value})}
            required
          >
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Complete Signup'}
        </button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};
```

## 4. Migration Page (for existing Google users)

```jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const MigrateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const linkToken = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLinkAccounts = async () => {
    if (!linkToken) {
      setError('Invalid link token');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/riot/link-accounts', {
        token: linkToken
      }, {
        headers: {
          'X-API-KEY': 'your-api-key'
        }
      });

      // Update stored token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      alert('Account successfully migrated to Riot Sign-On!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Migration failed');
      setLoading(false);
    }
  };

  const handleStartMigration = async () => {
    // Start Riot OAuth flow for migration
    try {
      const response = await axios.get('/api/auth/riot/init', {
        headers: {
          'X-API-KEY': 'your-api-key'
        }
      });
      
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Failed to start migration');
    }
  };

  return (
    <div className="migration-page">
      <h2>Migrate to Riot Sign-On</h2>
      
      {linkToken ? (
        <div>
          <p>We found your Riot account! Click below to complete the migration.</p>
          <button onClick={handleLinkAccounts} disabled={loading}>
            {loading ? 'Migrating...' : 'Complete Migration'}
          </button>
        </div>
      ) : (
        <div>
          <p>Google authentication is no longer supported.</p>
          <p>You must migrate your account to Riot Sign-On to continue using the app.</p>
          <button onClick={handleStartMigration}>
            Start Migration with Riot
          </button>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

## 5. Update API Service

```javascript
// api.service.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'X-API-KEY': process.env.REACT_APP_API_KEY // Your X_API_KEY
  }
});

// Add token to requests if logged in
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle migration required errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && 
        error.response?.data?.error === 'migration_required') {
      // Redirect to migration page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/migrate-account';
    }
    return Promise.reject(error);
  }
);

export default API;
```

## 6. Routes Setup

```jsx
// App.js or Routes.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/complete-signup" element={<CompleteSignup />} />
        <Route path="/migrate-account" element={<MigrateAccount />} />
        <Route path="/link-accounts" element={<MigrateAccount />} />
        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 7. Protected Route Component

```jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Optional: Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

## 8. Styling for Riot Login Button

```css
.riot-login-btn {
  background: linear-gradient(135deg, #c89b3c 0%, #f0e6d2 100%);
  color: #0c1f1f;
  border: 2px solid #c89b3c;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.riot-login-btn:hover {
  background: linear-gradient(135deg, #f0e6d2 0%, #c89b3c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(200, 155, 60, 0.3);
}

.riot-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Add Riot logo */
.riot-login-btn::before {
  content: '';
  width: 24px;
  height: 24px;
  background: url('/riot-logo.svg') no-repeat center;
  background-size: contain;
}
```

## Testing Flow

1. **New User Flow:**
   - Click "Sign in with Riot" → Riot login → Complete signup → Dashboard

2. **Existing Riot User Flow:**
   - Click "Sign in with Riot" → Riot login → Dashboard

3. **Migration Flow (Google users):**
   - Try to login → Get migration error → Migration page → Riot login → Account linked → Dashboard

## Environment Variables for Frontend

Create a `.env` file in your frontend directory:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_API_KEY=ExQA#h~.l{@VHv>Mw@K7F':Y|7dp',>Tv]9UvQbxO)l?9~#sqs%E-#ZrtzJQWbl
```

## Important Notes

1. **Remove all Google OAuth code** from your frontend
2. **Update all login/signup forms** to use Riot SSO only
3. **Handle migration errors** (403 with migration_required)
4. **Test the complete flow** before deploying
5. **Add loading states** during OAuth redirects