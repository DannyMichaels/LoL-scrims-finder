import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeProvider, alpha } from '@mui/material/styles';
import { createBrandTheme } from '@/appTheme';
import { resolveHeroBackground } from '@/assets/heroBackgrounds';

function PreviewContent({ previewTheme, brandName, tagline, logoUrl, heroBackgroundUrl }) {
  return (
    <Box
      sx={{
        backgroundColor: previewTheme.palette.background.default,
        minHeight: '100%',
      }}>
      {/* Preview Navbar */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt="logo"
                style={{ width: 28, height: 28 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                background: `linear-gradient(135deg, ${previewTheme.palette.primary.main}, ${previewTheme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              {brandName}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${previewTheme.palette.primary.main}, ${previewTheme.palette.primary.dark})`,
              fontSize: '0.75rem',
            }}>
            Log In
          </Button>
        </Toolbar>
      </AppBar>

      {/* Preview Hero */}
      <Box
        sx={{
          py: 6,
          px: 3,
          textAlign: 'center',
          position: 'relative',
          backgroundImage: heroBackgroundUrl
            ? `url(${heroBackgroundUrl})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: heroBackgroundUrl
              ? `linear-gradient(180deg, rgba(10,14,26,0.85) 0%, ${previewTheme.palette.background.default} 100%)`
              : `linear-gradient(180deg, ${alpha(previewTheme.palette.primary.main, 0.05)} 0%, ${previewTheme.palette.background.default} 100%)`,
            zIndex: 0,
          },
          '& > *': { position: 'relative', zIndex: 1 },
        }}>
        <Typography
          sx={{
            fontSize: '2.5rem',
            fontWeight: 800,
            background: `linear-gradient(135deg, ${previewTheme.palette.primary.main}, ${previewTheme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            letterSpacing: '2px',
          }}>
          {brandName}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1rem',
            mb: 3,
          }}>
          {tagline}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${previewTheme.palette.primary.main}, ${previewTheme.palette.primary.dark})`,
            }}>
            Create Account
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: alpha(previewTheme.palette.primary.main, 0.5),
              color: previewTheme.palette.primary.main,
            }}>
            Login
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

const SCALE = 0.55;

export default function BrandingPreview({ formValues }) {
  const previewTheme = createBrandTheme(formValues.colors || {});
  const brandName = formValues.branding?.brandName || 'Brand Name';
  const tagline = formValues.branding?.tagline || 'Tagline';
  const logoUrl = formValues.branding?.logoUrl || '/reluminate-logo.png';
  const heroBackgroundKey = formValues.branding?.heroBackgroundUrl || '';
  const heroBackgroundUrl = resolveHeroBackground(heroBackgroundKey);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const innerRef = useRef(null);

  useEffect(() => {
    if (!innerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });
    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, []);

  const contentProps = { previewTheme, brandName, tagline, logoUrl, heroBackgroundUrl };

  return (
    <ThemeProvider theme={previewTheme}>
      {/* Inline scaled preview */}
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={() => setDialogOpen(true)}
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
          }}>
          <OpenInFullIcon fontSize="small" />
        </IconButton>

        <Box
          sx={{
            overflow: 'hidden',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)',
            height: contentHeight ? contentHeight * SCALE : 'auto',
          }}>
          <Box
            ref={innerRef}
            sx={{
              transform: `scale(${SCALE})`,
              transformOrigin: 'top left',
              width: `${100 / SCALE}%`,
            }}>
            <PreviewContent {...contentProps} />
          </Box>
        </Box>
      </Box>

      {/* Fullscreen dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: previewTheme.palette.background.default,
            backgroundImage: 'none',
            overflow: 'hidden',
          },
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            Full Preview
          </Typography>
          <IconButton
            onClick={() => setDialogOpen(false)}
            size="small"
            sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0 }}>
          <PreviewContent {...contentProps} />
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
