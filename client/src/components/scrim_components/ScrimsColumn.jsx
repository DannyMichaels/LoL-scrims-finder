import { Fragment } from 'react';
import { InnerColumn } from '../shared/PageComponents';
import Typography from '@mui/material/Typography';
import { Fade } from 'react-awesome-reveal';
import ScrimSection from './ScrimSection';
import GlassPanel from '../shared/GlassPanel';
import Box from '@mui/material/Box';

// used in Scrims.jsx
export default function ScrimsColumn({ show, scrims, headerText, altText }) {
  return (
    show && (
      <>
        <InnerColumn>
          <GlassPanel
            variant="blue"
            sx={{
              mb: 4,
              p: 3,
              textAlign: 'center',
            }}>
            <Typography 
              align="center" 
              variant="h1" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #64B5F6 0%, #2196F3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              {scrims.length > 0 ? headerText : altText}
            </Typography>
          </GlassPanel>
        </InnerColumn>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {scrims.map((scrim) => (
            <Fragment key={scrim._id}>
              <Fade triggerOnce>
                <ScrimSection scrimData={scrim} />
              </Fade>
            </Fragment>
          ))}
        </Box>
        <div className="page-break" />
      </>
    )
  );
}
