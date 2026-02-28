import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
import { createBrandTheme } from '../appTheme';
import api from '../services/apiConfig';

export const BrandingContext = createContext(null);

const DEFAULT_BRANDING = {
  brandName: 'RELUMINATE.GG',
  tagline: 'Lighting up the rift',
  logoUrl: '/reluminate-logo.png',
  faviconUrl: '/reluminate-logo.png',
  heroBackgroundUrl: '',
};

const DEFAULT_SOCIAL_LINKS = {
  discord: '',
  twitch: '',
  twitter: '',
};

export default function BrandingProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBranding() {
      try {
        const hostname = window.location.hostname;
        const { data } = await api.get(`/branding?hostname=${hostname}`);
        setConfig(data);

        // Update favicon, apple-touch-icon, and og:image
        if (data?.branding?.faviconUrl) {
          const faviconUrl = data.branding.faviconUrl;
          const iconLink =
            document.querySelector("link[rel='icon']") ||
            document.querySelector("link[rel='shortcut icon']");
          if (iconLink) iconLink.href = faviconUrl;

          const appleIcon = document.querySelector(
            "link[rel='apple-touch-icon']"
          );
          if (appleIcon) appleIcon.href = faviconUrl;

          const ogImage = document.querySelector("meta[property='og:image']");
          if (ogImage) ogImage.setAttribute('content', faviconUrl);
        }

        // Update manifest link
        const manifestLink = document.querySelector("link[rel='manifest']");
        if (manifestLink) {
          const apiBase =
            process.env.NODE_ENV === 'production'
              ? process.env.REACT_APP_API_URL
              : 'http://localhost:3000/api';
          manifestLink.href = `${apiBase}/branding/manifest?hostname=${hostname}`;
        }
      } catch (err) {
        console.error('Failed to fetch branding config:', err);
        // Fall back to defaults — app still renders
      } finally {
        setLoading(false);
      }
    }

    fetchBranding();
  }, []);

  const theme = useMemo(
    () => createBrandTheme(config?.colors || {}),
    [config]
  );

  const branding = useMemo(
    () => ({
      brandName: config?.branding?.brandName || DEFAULT_BRANDING.brandName,
      tagline: config?.branding?.tagline || DEFAULT_BRANDING.tagline,
      logoUrl: config?.branding?.logoUrl || DEFAULT_BRANDING.logoUrl,
      faviconUrl: config?.branding?.faviconUrl || DEFAULT_BRANDING.faviconUrl,
      heroBackgroundUrl:
        config?.branding?.heroBackgroundUrl ||
        DEFAULT_BRANDING.heroBackgroundUrl,
      socialLinks: config?.socialLinks || DEFAULT_SOCIAL_LINKS,
      featureCards: config?.featureCards || [],
      colors: config?.colors || {},
      _id: config?._id,
      slug: config?.slug,
    }),
    [config]
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0a0e1a',
        }}
      >
        <CircularProgress size={40} sx={{ color: '#2196F3' }} />
      </Box>
    );
  }

  return (
    <BrandingContext.Provider value={branding}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrandingContext.Provider>
  );
}
