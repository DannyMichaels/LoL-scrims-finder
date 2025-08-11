import { Fragment } from 'react';
import { InnerColumn } from '@/components/shared/PageComponents';
import Typography from '@mui/material/Typography';
import { Fade, Slide } from 'react-awesome-reveal';
import ScrimSection from './ScrimSection';
import GlassPanel from '@/components/shared/GlassPanel';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

// used in Scrims.jsx
export default function ScrimsColumn({ show, scrims, headerText, altText, headerIcon }) {
  return (
    show && (
      <>
        <InnerColumn>
          <Slide direction="down" triggerOnce cascade damping={0.3}>
            <Box
              sx={{
                mb: 4,
                position: 'relative',
              }}>
              <Divider
                sx={{
                  mb: 3,
                  '&::before, &::after': {
                    borderTop: '2px solid rgba(33, 150, 243, 0.3)',
                  },
                }}>
                <GlassPanel
                  variant="elevated"
                  sx={{
                    px: 4,
                    py: 2,
                    display: 'inline-block',
                    borderRadius: '20px',
                    background:
                      'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(100, 181, 246, 0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    boxShadow: '0 8px 32px rgba(33, 150, 243, 0.2)',
                  }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {headerIcon && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {headerIcon}
                      </Box>
                    )}
                    <Typography
                      variant="h1"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        background:
                          'linear-gradient(135deg, #fff 0%, #64B5F6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 2px 10px rgba(33, 150, 243, 0.3)',
                        letterSpacing: '0.5px',
                      }}>
                      {scrims.length > 0 ? headerText : altText}
                      {scrims.length > 0 && (
                        <Box
                          component="span"
                          sx={{
                            ml: 2,
                            fontSize: '0.8em',
                            opacity: 0.8,
                            fontWeight: 600,
                          }}>
                          ({scrims.length})
                        </Box>
                      )}
                    </Typography>
                  </Box>
                </GlassPanel>
              </Divider>
            </Box>
          </Slide>
        </InnerColumn>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {scrims.map((scrim, index) => (
            <Fragment key={scrim._id}>
              <Fade
                triggerOnce
                delay={index * 50}
                cascade
                damping={0.3}
                style={{
                  transform: 'perspective(1000px)',
                }}>
                <Box
                  sx={{
                    transition: 'all 0.3s ease',
                  }}>
                  <ScrimSection scrimData={scrim} />
                </Box>
              </Fade>
            </Fragment>
          ))}
        </Box>
        <div className="page-break" />
      </>
    )
  );
}
