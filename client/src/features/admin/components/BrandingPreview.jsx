import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import { ThemeProvider, alpha, darken } from '@mui/material/styles';
import { createBrandTheme } from '@/appTheme';
import { resolveHeroBackground } from '@/assets/heroBackgrounds';

function PreviewContent({ previewTheme, brandName, tagline, logoUrl, heroBackgroundUrl, featureCards }) {
  const pt = previewTheme.palette;

  return (
    <Box
      sx={{
        backgroundColor: pt.background.default,
        minHeight: '100%',
      }}>
      {/* Preview Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: alpha(pt.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(pt.primary.main, 0.1)}`,
        }}>
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
                background: `linear-gradient(135deg, ${pt.primary.main}, ${pt.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              {brandName}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: alpha(pt.primary.main, 0.5),
                color: '#fff',
                fontSize: '0.75rem',
                '&:hover': {
                  borderColor: pt.primary.main,
                  background: alpha(pt.primary.main, 0.1),
                },
              }}>
              Login
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${pt.primary.main}, ${pt.primary.dark})`,
                color: pt.primary.contrastText,
                fontSize: '0.75rem',
                '&:hover': {
                  background: `linear-gradient(135deg, ${pt.primary.dark}, ${darken(pt.primary.dark, 0.1)})`,
                },
              }}>
              Sign Up
            </Button>
          </Box>
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
              ? `linear-gradient(180deg, rgba(10,14,26,0.85) 0%, ${pt.background.default} 100%)`
              : `linear-gradient(180deg, ${alpha(pt.primary.main, 0.05)} 0%, ${pt.background.default} 100%)`,
            zIndex: 0,
          },
          '& > *': { position: 'relative', zIndex: 1 },
        }}>
        <Typography
          sx={{
            fontSize: '2.5rem',
            fontWeight: 800,
            background: `linear-gradient(135deg, ${pt.primary.main}, ${pt.primary.light})`,
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
            mb: 1,
          }}>
          {tagline}
        </Typography>

        {/* Social buttons */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
          {['Discord', 'Twitch', 'Twitter'].map((label) => (
            <Button
              key={label}
              size="small"
              sx={{
                background: alpha(pt.primary.main, 0.1),
                border: `1px solid ${alpha(pt.primary.main, 0.3)}`,
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderRadius: '8px',
                px: 1.5,
                '&:hover': {
                  background: alpha(pt.primary.main, 0.2),
                  border: `1px solid ${alpha(pt.primary.main, 0.5)}`,
                },
              }}>
              {label}
            </Button>
          ))}
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            background: alpha(pt.primary.main, 0.05),
            border: `1px solid ${alpha(pt.primary.main, 0.2)}`,
            borderRadius: '12px',
            p: 2.5,
            maxWidth: '400px',
            mx: 'auto',
            backdropFilter: 'blur(4px)',
          }}>
          <Typography
            sx={{
              color: pt.primary.main,
              fontSize: '1.1rem',
              fontWeight: 600,
              mb: 1,
            }}>
            Ready to Find Your Perfect Scrim?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${pt.primary.main}, ${pt.primary.dark})`,
                color: pt.primary.contrastText,
                fontSize: '0.75rem',
              }}>
              Create Account
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: pt.primary.main,
                color: pt.primary.main,
                fontSize: '0.75rem',
              }}>
              Login
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Sample Scrim Card */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Box
          sx={{
            background: alpha(pt.primary.main, 0.03),
            border: `1px solid ${alpha(pt.primary.main, 0.15)}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
          {/* Scrim header */}
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${alpha(pt.primary.main, 0.1)}`,
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  Sample Scrim
                </Typography>
                <Chip
                  label="NA"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(76, 175, 80, 0.12)',
                    border: '1px solid rgba(76, 175, 80, 0.37)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: '24px',
                  }}
                />
              </Box>
              <Button
                variant="contained"
                size="small"
                sx={{
                  background: `linear-gradient(135deg, ${pt.primary.main}, ${pt.primary.dark})`,
                  color: pt.primary.contrastText,
                  fontSize: '0.7rem',
                  minWidth: 'auto',
                }}>
                <ShareIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} /> Share
              </Button>
            </Box>

            {/* Game Start Time card */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(pt.primary.main, 0.15)}, ${alpha(pt.primary.light, 0.08)})`,
                borderRadius: '10px',
                border: `1px solid ${alpha(pt.primary.main, 0.2)}`,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${pt.primary.main}, ${pt.primary.light})`,
                  boxShadow: `0 4px 15px ${alpha(pt.primary.main, 0.4)}`,
                }}>
                <ScheduleIcon sx={{ color: pt.primary.contrastText, fontSize: '1.2rem' }} />
              </Box>
              <Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Game Start Time
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                  Mar 01, 2026 · 8:00 PM
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Expand button area */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              height: '2.5em',
              borderTop: `1px solid rgba(255,255,255,0.1)`,
            }}>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: pt.primary.main,
                border: `1px solid ${pt.primary.dark}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(50%)',
                boxShadow: `0 2px 8px ${alpha(pt.primary.main, 0.3)}`,
              }}>
              <ExpandMoreIcon sx={{ color: pt.primary.contrastText, fontSize: '1.2rem' }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Feature Cards */}
      {featureCards && featureCards.length > 0 && (
        <Box sx={{ px: 3, pb: 3, backgroundColor: pt.background.paper }}>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            {featureCards.filter((c) => c.title).map((card, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: `1 1 ${featureCards.length <= 2 ? '200px' : '140px'}`,
                  maxWidth: '220px',
                  background: 'rgba(18, 24, 38, 0.6)',
                  borderRadius: '12px',
                  border: `1px solid ${alpha(pt.primary.main, 0.15)}`,
                  p: 1.5,
                  textAlign: 'center',
                }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(pt.primary.main, 0.1)}, ${alpha(pt.primary.main, 0.2)})`,
                    border: `1px solid ${alpha(pt.primary.main, 0.3)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1,
                  }}>
                  {card.icon ? (
                    <img src={card.icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                  ) : (
                    <StarIcon sx={{ fontSize: 16, color: pt.primary.main }} />
                  )}
                </Box>
                <Typography sx={{ color: pt.primary.main, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.5rem', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                  {(card.description || '').split('\n').slice(0, 2).join('\n')}
                  {(card.description || '').split('\n').length > 2 ? '...' : ''}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          py: 2,
          textAlign: 'center',
          borderTop: `1px solid rgba(255,255,255,0.05)`,
        }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
          &copy; 2026 {brandName}. All rights reserved.
        </Typography>
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

  const featureCards = formValues.featureCards || [];
  const contentProps = { previewTheme, brandName, tagline, logoUrl, heroBackgroundUrl, featureCards };

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
