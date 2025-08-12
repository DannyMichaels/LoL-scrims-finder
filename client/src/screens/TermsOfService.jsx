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

export default function TermsOfService() {
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
                Terms of Service
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
                  1. Acceptance of Terms
                </Typography>
                <Typography variant="body1" paragraph>
                  By accessing and using LoL Scrims Finder ("the Service"), you
                  agree to be bound by these Terms of Service. If you do not
                  agree to these terms, please do not use the Service.
                </Typography>

                <Typography variant="h5" component="h2">
                  2. Description of Service
                </Typography>
                <Typography variant="body1" paragraph>
                  LoL Scrims Finder provides a platform for League of Legends
                  players to:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>Organize and join custom scrimmage matches</li>
                  <li>Track match statistics and win rates</li>
                  <li>Connect with other players</li>
                  <li>Participate in community tournaments</li>
                </Typography>

                <Typography variant="h5" component="h2">
                  3. User Accounts
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Account Creation:</strong> You must authenticate using
                  Riot Sign-On (RSO) to create an account.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Account Security:</strong> You are responsible for
                  maintaining the security of your account.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Accurate Information:</strong> You agree to provide
                  accurate Discord username and region information.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>One Account Policy:</strong> Each user may only have
                  one account. Multiple accounts (smurfing) on our platform is
                  prohibited.
                </Typography>

                <Typography variant="h5" component="h2">
                  4. User Conduct
                </Typography>
                <Typography variant="body1" paragraph>
                  You agree NOT to:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>
                    Use the Service for any illegal or unauthorized purpose
                  </li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Create false or misleading scrims</li>
                  <li>Manipulate match results or statistics</li>
                  <li>Use automated bots or scripts</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Impersonate other players or Riot Games staff</li>
                  <li>Share or sell your account</li>
                  <li>Engage in toxic behavior or hate speech</li>
                </Typography>

                <Typography variant="h5" component="h2">
                  5. Scrim Rules
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Fair Play:</strong> All participants must follow the
                  rules set by the scrim host.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Reporting Results:</strong> Scrim captains must
                  accurately report match results.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>No-Shows:</strong> Repeated failure to show up for
                  joined scrims may result in penalties.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Disputes:</strong> Match disputes should be resolved
                  between team captains. The Service is not responsible for
                  dispute resolution.
                </Typography>

                <Typography variant="h5" component="h2">
                  6. Tournaments
                </Typography>
                <Typography variant="body1" paragraph>
                  If the Service offers tournament features:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>Entry fees (if any) must be clearly stated</li>
                  <li>At least 70% of entry fees go to prize pool</li>
                  <li>Tournament rules must be followed by all participants</li>
                  <li>
                    Cheating or match-fixing results in immediate
                    disqualification and ban
                  </li>
                </Typography>

                <Typography variant="h5" component="h2">
                  7. Content and Intellectual Property
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>User Content:</strong> You retain ownership of content
                  you create but grant us license to display it on the Service.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Riot Games Property:</strong> League of Legends and
                  all related content are property of Riot Games, Inc.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Service Content:</strong> The Service's design,
                  features, and content are protected by copyright and other
                  laws.
                </Typography>

                <Typography variant="h5" component="h2">
                  8. Privacy
                </Typography>
                <Typography variant="body1" paragraph>
                  Your use of the Service is also governed by our{' '}
                  <Link to="/privacy-policy">Privacy Policy</Link>.
                </Typography>

                <Typography variant="h5" component="h2">
                  9. Disclaimers
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Service Availability:</strong> The Service is provided
                  "as is" without warranties. We do not guarantee uninterrupted
                  or error-free service.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Third-Party Services:</strong> We are not responsible
                  for Riot Games services or League of Legends game
                  availability.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>User Interactions:</strong> We are not responsible for
                  user behavior or content. Users interact at their own risk.
                </Typography>

                <Typography variant="h5" component="h2">
                  10. Limitation of Liability
                </Typography>
                <Typography variant="body1" paragraph>
                  To the maximum extent permitted by law, LoL Scrims Finder
                  shall not be liable for any indirect, incidental, special, or
                  consequential damages resulting from your use of the Service.
                </Typography>

                <Typography variant="h5" component="h2">
                  11. Account Termination
                </Typography>
                <Typography variant="body1" paragraph>
                  We reserve the right to suspend or terminate accounts that
                  violate these terms, including:
                </Typography>
                <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
                  <li>Toxic behavior or harassment</li>
                  <li>Cheating or match manipulation</li>
                  <li>Multiple account violations</li>
                  <li>Any illegal activities</li>
                </Typography>
                <Typography variant="body1" paragraph>
                  You may delete your account at any time through the settings
                  page.
                </Typography>

                <Typography variant="h5" component="h2">
                  12. Modifications to Service
                </Typography>
                <Typography variant="body1" paragraph>
                  We reserve the right to modify or discontinue the Service at
                  any time. We will provide notice of significant changes when
                  possible.
                </Typography>

                <Typography variant="h5" component="h2">
                  13. Changes to Terms
                </Typography>
                <Typography variant="body1" paragraph>
                  We may update these Terms of Service from time to time.
                  Continued use of the Service after changes constitutes
                  acceptance of new terms.
                </Typography>

                <Typography variant="h5" component="h2">
                  14. Governing Law
                </Typography>
                <Typography variant="body1" paragraph>
                  These Terms shall be governed by the laws of the United
                  States, without regard to conflict of law principles.
                </Typography>

                <Typography variant="h5" component="h2">
                  15. Contact Information
                </Typography>
                <Typography variant="body1" paragraph>
                  For questions about these Terms of Service, contact us at:
                </Typography>
                <Typography variant="body1" paragraph>
                  Email: itzdanielmichael@gmail.com
                  <br />
                </Typography>

                <Typography variant="h5" component="h2">
                  16. Disclaimer
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>
                    LoL Scrims Finder is not affiliated with or endorsed by Riot
                    Games, Inc.
                  </strong>
                  League of Legends and Riot Games are trademarks or registered
                  trademarks of Riot Games, Inc.
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
                  to="/privacy-policy"
                  variant="outlined">
                  Privacy Policy
                </Button>
              </Box>
            </Paper>
          </Container>
        </PageContent>
      </PageSection>
    </>
  );
}
