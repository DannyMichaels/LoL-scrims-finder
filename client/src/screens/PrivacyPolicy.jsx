import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Navbar from '@/components/shared/Navbar/Navbar';
import { PageSection, PageContent } from '@/components/shared/PageComponents';

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <PageSection>
        <PageContent>
          <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                align="center">
                Privacy Policy
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 4 }}>
                Last Updated: {new Date().toLocaleDateString()}
              </Typography>

              <Divider sx={{ mb: 4 }} />

              <Box sx={{ '& h2': { mt: 4, mb: 2 }, '& p': { mb: 2 } }}>
                <Typography variant="h5" component="h2">
                  1. Information We Collect
                </Typography>
                <Typography variant="body1" paragraph>
                  When you sign up for LoL Scrims Finder using Riot Sign-On
                  (RSO), we collect:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>Your Riot account ID (PUUID)</li>
                  <li>Your summoner name and tagline</li>
                  <li>Your current rank and region</li>
                  <li>Your Discord username (provided by you)</li>
                  <li>
                    Match statistics from scrims played through our platform
                  </li>
                </Typography>

                <Typography variant="h5" component="h2">
                  2. How We Use Your Information
                </Typography>
                <Typography variant="body1" paragraph>
                  We use your information solely to:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>Verify you are a real League of Legends player</li>
                  <li>Display your profile to other players in scrims</li>
                  <li>Track your win/loss statistics</li>
                  <li>Match you with appropriate skill-level scrims</li>
                  <li>Enable friend connections within the platform</li>
                </Typography>

                <Typography variant="h5" component="h2">
                  3. Data Sharing
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>We NEVER sell your personal data.</strong>
                </Typography>
                <Typography variant="body1" paragraph>
                  Your profile information is only visible to other registered
                  users of LoL Scrims Finder. We do not share your data with
                  third parties except:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>Riot Games (for authentication via RSO)</li>
                  <li>When required by law</li>
                </Typography>

                <Typography variant="h5" component="h2">
                  4. Data Security
                </Typography>
                <Typography variant="body1" paragraph>
                  We implement industry-standard security measures:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>HTTPS/SSL encryption for all data transmission</li>
                  <li>Secure server-side storage of authentication tokens</li>
                  <li>No storage of Riot account passwords</li>
                  <li>Regular security updates</li>
                </Typography>

                <Typography variant="h5" component="h2">
                  5. Your Rights
                </Typography>
                <Typography variant="body1" paragraph>
                  You have the right to:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of email communications</li>
                </Typography>

                <Typography variant="h5" component="h2">
                  6. Cookies
                </Typography>
                <Typography variant="body1" paragraph>
                  We use essential cookies for:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>Maintaining your login session</li>
                  <li>Storing your preferences</li>
                </Typography>
                <Typography variant="body1" paragraph>
                  We do not use tracking or advertising cookies.
                </Typography>

                <Typography variant="h5" component="h2">
                  7. Children's Privacy
                </Typography>
                <Typography variant="body1" paragraph>
                  Our service is not intended for children under 13. We do not
                  knowingly collect data from children under 13. League of
                  Legends requires players to be at least 13 years old.
                </Typography>

                <Typography variant="h5" component="h2">
                  8. Third-Party Services
                </Typography>
                <Typography variant="body1" paragraph>
                  We integrate with:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>
                    <strong>Riot Games API</strong>: For authentication and game
                    data
                  </li>
                  <li>
                    <strong>Discord</strong>: For username display only (no
                    integration)
                  </li>
                </Typography>

                <Typography variant="h5" component="h2">
                  9. Data Retention
                </Typography>
                <Typography variant="body1" paragraph>
                  We retain your data as long as your account is active. If you
                  delete your account, we will remove your personal data within
                  30 days, except where retention is required by law.
                </Typography>

                <Typography variant="h5" component="h2">
                  10. Changes to This Policy
                </Typography>
                <Typography variant="body1" paragraph>
                  We may update this privacy policy from time to time. We will
                  notify users of any material changes via email or platform
                  notification.
                </Typography>

                <Typography variant="h5" component="h2">
                  11. Contact Us
                </Typography>
                <Typography variant="body1" paragraph>
                  If you have questions about this privacy policy or your data,
                  contact us at:
                </Typography>
                <Typography variant="body1" paragraph>
                  Email: itzdanielmichael@gmail.com
                  <br />
                </Typography>

                <Typography variant="h5" component="h2">
                  12. Legal Disclaimer
                </Typography>
                <Typography variant="body1" paragraph>
                  LoL Scrims Finder is not affiliated with or endorsed by Riot
                  Games, Inc. League of Legends and Riot Games are trademarks or
                  registered trademarks of Riot Games, Inc.
                </Typography>
              </Box>

              <Divider sx={{ mt: 4, mb: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  component={Link}
                  to="/signup"
                  variant="contained"
                  color="primary">
                  Back to Sign Up
                </Button>
                <Button
                  component={Link}
                  to="/terms-of-service"
                  variant="outlined">
                  Terms of Service
                </Button>
              </Box>
            </Paper>
          </Container>
        </PageContent>
      </PageSection>
    </>
  );
}
