import { useMemo, useState, useEffect } from 'react';
import useAuth from './../../hooks/useAuth';
import useAlerts from './../../hooks/useAlerts';
import useScrimStore from '../../stores/scrimStore';

// components
import CountdownTimer from './CountdownTimer';
import UploadPostGameImage from './UploadPostGameImage';
import Tooltip from '../shared/Tooltip';

// Mui components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

//icons
import InfoIcon from '@mui/icons-material/Info';

// utils
import { makeStyles } from '@mui/styles';
import { copyTextToClipboard } from './../../utils/copyToClipboard';
import pluralize from 'pluralize';

// Removed direct service import - using store instead

const useStyles = makeStyles({
  infoBoxRoot: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: '16px',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(33, 150, 243, 0.3)',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor: 'rgba(33, 150, 243, 0.15)',
      border: '1px solid rgba(33, 150, 243, 0.4)',
      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
    },
  },
});

//  this is the area that contains the countdown timer for the scrim section and the other details.
export default function ScrimSectionMiddleAreaBox({
  imageUploaded,
  scrim,
  gameStarted,
  setGameStarted,
  gameEnded,
  playerEntered,
  casterEntered,
  setScrim,
  socket,
}) {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();
  const { setWinner } = useScrimStore();

  const classes = useStyles();

  const { teamOne, teamTwo } = scrim;

  const teamOneDifference = useMemo(() => 5 - teamOne.length, [teamOne]);
  const teamTwoDifference = useMemo(() => 5 - teamTwo.length, [teamTwo]);

  // Add a transitioning state for when game just started
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (
      gameStarted &&
      !scrim.riotTournament?.tournamentCode &&
      scrim.teamOne.length === 5 &&
      scrim.teamTwo.length === 5
    ) {
      // Game just started, teams are full, waiting for tournament code
      setIsTransitioning(true);
      // Clear transitioning state after 5 seconds if no tournament code received
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 5000);
      return () => clearTimeout(timeout);
    } else {
      setIsTransitioning(false);
    }
  }, [
    gameStarted,
    scrim.riotTournament?.tournamentCode,
    scrim.teamOne.length,
    scrim.teamTwo.length,
  ]);

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center">
      <div className={classes.infoBoxRoot}>
        {!gameStarted && (
          <Typography variant="h2">Game starting in...</Typography>
        )}

        <CountdownTimer
          gameStarted={gameStarted}
          setGameStarted={setGameStarted}
          scrim={scrim}
        />

        {gameStarted &&
          (scrim.teamOne.length === 5 && scrim.teamTwo.length === 5 ? (
            <>
              {!gameEnded && (
                <>
                  {/* show lobby info only to players in lobby or admins */}
                  {playerEntered || casterEntered || isCurrentUserAdmin ? (
                    <>
                      {/* Show loading state when transitioning */}
                      {isTransitioning ? (
                        <Grid
                          item
                          container
                          direction="column"
                          alignItems="center"
                          spacing={2}>
                          <Grid item>
                            <CircularProgress
                              size={40}
                              style={{ color: '#4CAF50' }}
                            />
                          </Grid>
                          <Grid item>
                            <Typography variant="h2">
                              Generating Tournament Code...
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Typography
                              variant="body1"
                              style={{ fontStyle: 'italic', color: '#ccc' }}>
                              Please wait while we set up your lobby
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : scrim.riotTournament?.tournamentCode ? (
                        <>
                          <Grid item container direction="column" spacing={2}>
                            <Grid
                              item
                              container
                              direction="row"
                              alignItems="center">
                              <Typography variant="h3">
                                Tournament Code:
                              </Typography>
                              <Box marginLeft={2}>
                                <Tooltip title="Click to copy tournament code">
                                  <Button
                                    variant="contained"
                                    style={{
                                      backgroundColor: '#4CAF50',
                                      color: 'white',
                                      fontWeight: 'bold',
                                      fontSize: '1.1em',
                                      padding: '10px 20px',
                                    }}
                                    onClick={() => {
                                      copyTextToClipboard(
                                        scrim.riotTournament.tournamentCode
                                      );
                                      setCurrentAlert({
                                        type: 'Success',
                                        message:
                                          'Tournament code copied! Paste it in the League client to join.',
                                      });
                                    }}>
                                    {scrim.riotTournament.tournamentCode}
                                  </Button>
                                </Tooltip>
                              </Box>
                            </Grid>

                            <Grid item>
                              <Typography
                                variant="body1"
                                style={{ fontStyle: 'italic' }}>
                                📋 <strong>How to join:</strong>
                              </Typography>
                              <Typography
                                variant="body2"
                                style={{ marginLeft: '20px' }}>
                                1. Open League of Legends client
                                <br />
                                2. Click "Play" → "Tournament Code" (trophy icon
                                on top right)
                                <br />
                                3. Paste the code above and click "Join"
                                <br />
                                4. The lobby is automatically configured with:
                                <br />
                                {'\u00A0\u00A0\u00A0\u00A0'}• Tournament Draft
                                mode (competitive pick/ban)
                                <br />
                                {'\u00A0\u00A0\u00A0\u00A0'}• Private access
                                (only those with the code can join)
                                <br />
                                {'\u00A0\u00A0\u00A0\u00A0'}• Automatic game
                                recording for results
                              </Typography>
                            </Grid>

                            <Grid
                              item
                              container
                              direction="row"
                              alignItems="center">
                              <Typography variant="body2">
                                <strong>Lobby Captain:</strong>{' '}
                                {scrim.lobbyHost?.name || 'Auto-assigned'}
                              </Typography>
                              <Box marginLeft={1}>
                                <Tooltip title="The lobby captain is responsible for reporting the winner after the game">
                                  <InfoIcon
                                    style={{ cursor: 'help', fontSize: '18px' }}
                                  />
                                </Tooltip>
                              </Box>
                            </Grid>
                          </Grid>
                        </>
                      ) : (
                        <>
                          {/* Fallback to manual lobby creation if tournament code fails */}
                          <Grid
                            item
                            container
                            direction="row"
                            alignItems="center">
                            <Typography variant="h2">
                              Lobby host / captain: {scrim.lobbyHost?.name}
                            </Typography>
                            <Box marginRight={2} />
                            <Tooltip title="The lobby captain must create the custom lobby manually and select who won after the game">
                              <InfoIcon
                                style={{ cursor: 'help' }}
                                fontSize="large"
                              />
                            </Tooltip>
                          </Grid>

                          <Typography variant="h3" style={{ color: '#ff9800' }}>
                            ⚠️ Manual Lobby Creation Required
                          </Typography>
                          <Typography
                            variant="body2"
                            style={{
                              marginBottom: '10px',
                              fontStyle: 'italic',
                            }}>
                            Tournament code generation failed. Please create the
                            lobby manually:
                          </Typography>

                          <Typography variant="h3">
                            Lobby name: <br />{' '}
                            <Tooltip title="Copy lobby name to clipboard">
                              <span
                                className="link"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  copyTextToClipboard(scrim.lobbyName);
                                  setCurrentAlert({
                                    type: 'Success',
                                    message: 'Lobby name copied to clipboard',
                                  });
                                }}>
                                "{scrim.lobbyName}"
                              </span>
                            </Tooltip>
                          </Typography>
                          <Typography variant="h3">
                            Password:{' '}
                            <Tooltip title="Copy password to clipboard">
                              <span
                                className="link"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  copyTextToClipboard(scrim.lobbyPassword);
                                  setCurrentAlert({
                                    type: 'Success',
                                    message: 'Password copied to clipboard',
                                  });
                                }}>
                                {scrim.lobbyPassword}
                              </span>
                            </Tooltip>
                          </Typography>
                        </>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </>
              )}

              {/* WHO WON ? BUTTONS */}
              {/* show buttons if is admin or is lobby captain */}
              {/* don't show if game has ended */}
              {(scrim.lobbyHost?._id === currentUser?._id ||
                isCurrentUserAdmin) &&
                !gameEnded && (
                  // WHO WON BUTTONS
                  <Grid item container direction="column">
                    <Grid item>
                      <Typography
                        variant="h3"
                        style={{ textDecoration: 'underline' }}>
                        Who won?
                      </Typography>
                    </Grid>

                    <Grid item container direction="row" spacing={2}>
                      {/* winner buttons (Who won?) */}
                      {['teamOne', 'teamTwo'].map((teamName, idx) => {
                        const teamAliases = {
                          teamOne: 'Team One (Blue Side)',
                          teamTwo: 'Team Two (Red Side)',
                        };

                        return (
                          <Grid item key={idx}>
                            <Tooltip
                              title={`Select ${teamAliases[teamName]} as winner`}>
                              <Button
                                style={{
                                  backgroundColor: idx === 0 ? 'blue' : 'red',
                                  color: '#fff',
                                }}
                                variant="contained"
                                onClick={async () => {
                                  // set team won for scrim
                                  let yes =
                                    window.confirm(`Are you sure ${teamName} won this game? \n 
                                  You cannot reverse this.
                                  `);

                                  if (!yes) return;

                                  const updatedScrim = await setWinner(
                                    scrim._id,
                                    teamName,
                                    setCurrentAlert
                                  );

                                  if (updatedScrim) {
                                    setScrim(updatedScrim);
                                    // Socket emission is handled in the store
                                  }
                                }}>
                                {teamAliases[teamName]}
                              </Button>
                            </Tooltip>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                )}

              {/*  allow image upload if both teams are filled and 
                    the current user is the host or creator of scrim or an admin.
                  */}
              {/* POST GAME IMAGE SECTION */}
              {(scrim.lobbyHost?._id === currentUser?._id ||
                isCurrentUserAdmin) && (
                <>
                  {/* disabled for now until we get money for another image hosting solution... */}
                  <Box marginTop={2} />

                  {/* UPLOAD OR DELETE IMAGE */}
                  <UploadPostGameImage
                    isUploaded={imageUploaded}
                    scrim={scrim}
                    socket={socket}
                    setScrim={setScrim}
                  />
                </>
              )}
              {imageUploaded && (
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}>
                  <Grid item>
                    <Typography variant="h3">
                      Post-game image uploaded!
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      component="a"
                      href={scrim.postGameImage?.location}
                      rel="noreferrer"
                      target="_blank">
                      View Image
                    </Button>
                  </Grid>
                </Grid>
              )}
            </>
          ) : (
            <>
              <Typography variant="h2">
                Not enough players: {`${teamOne.length + teamTwo.length}/10`}
              </Typography>
              <Typography variant="h5" component="p" className="text-white">
                Please get
                {/* if teamOne still needs players show this else don't show */}
                {teamOneDifference > 0 ? (
                  <>
                    {' '}
                    {teamOneDifference}{' '}
                    {/* spell check singular and plural with pluralize */}
                    {pluralize('players', teamOneDifference)} in Team 1 <br />
                  </>
                ) : null}
                {/* if teamTwo needs players, show this text. */}
                {teamTwoDifference > 0 ? (
                  <>
                    {/* if team one needs players, show 'and', else don't show 'and' */}
                    {teamOneDifference > 0 ? 'and' : ''} {teamTwoDifference}{' '}
                    {pluralize('players', teamTwoDifference)} in Team 2
                    <br />
                  </>
                ) : null}
                to unlock lobby name and password
              </Typography>
            </>
          ))}
      </div>
    </Grid>
  );
}
