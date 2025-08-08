import { useEffect, useState, useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import useScrimStore from '../../stores/scrimStore';
import useAuth from './../../hooks/useAuth';
import useAlerts from './../../hooks/useAlerts';
import useSocket from './../../hooks/useSocket';

// components
import ScrimSectionHeader from './ScrimSectionHeader';
import ScrimSectionMiddleAreaBox from './ScrimSectionMiddleAreaBox';
import ScrimTeamList from './ScrimTeamList';
import ScrimSectionExpander from './ScrimSectionExpander';
import { PageSection } from '../shared/PageComponents';
import devLog from '../../utils/devLog';

// utils
import { useScrimSectionStyles } from '../../styles/ScrimSection.styles';
import { compareDates } from '../../utils/compareDates';

// services
import {
  insertCasterInScrim,
  removeCasterFromScrim,
  deleteScrim,
} from '../../services/scrims.services';

export default function ScrimSection({ scrimData, isInDetail }) {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();
  const { socket } = useSocket();
  const history = useHistory();
  
  // Zustand store
  const {
    getScrim,
    setScrim,
    fetchScrim,
    isScrimExpanded,
    toggleScrimExpanded,
    joinScrimRoom,
    leaveScrimRoom,
    joinTeam,
    leaveTeam,
    movePlayer,
    deleteScrim: deleteScrimAction
  } = useScrimStore();
  
  // Get or initialize scrim data
  const scrimId = scrimData?._id;
  const scrim = getScrim(scrimId) || scrimData;
  
  // Local state
  const [playerEntered, setPlayerEntered] = useState(false);
  const [casterEntered, setCasterEntered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [swapPlayers, setSwapPlayers] = useState({
    playerOne: null,
    playerTwo: null,
  });
  
  const scrimBoxRef = useRef(null);
  
  // Control expansion - use store for regular view, always expanded in detail view
  const isBoxExpanded = isInDetail ? true : isScrimExpanded(scrimId);
  
  const setIsBoxExpanded = (value) => {
    if (!isInDetail) {
      toggleScrimExpanded(scrimId, value);
    }
  };
  
  const classes = useScrimSectionStyles({ scrim, isBoxExpanded });
  
  // Initialize scrim in store
  useEffect(() => {
    if (scrimData && scrimId) {
      setScrim(scrimId, scrimData);
    }
  }, [scrimData, scrimId, setScrim]);
  
  // Join/leave scrim room for socket updates
  useEffect(() => {
    if (isBoxExpanded && scrimId) {
      joinScrimRoom(scrimId);
      
      // Fetch fresh data when expanding (not in detail view)
      if (!isInDetail) {
        devLog(`scrim box expanded ${isBoxExpanded}, fetching data`);
        fetchScrim(scrimId);
      }
      
      return () => {
        if (!isInDetail) {
          leaveScrimRoom(scrimId);
        }
      };
    }
  }, [isBoxExpanded, scrimId, isInDetail, joinScrimRoom, leaveScrimRoom, fetchScrim]);
  
  // Check game start status
  useEffect(() => {
    if (scrim) {
      const gameHasStarted = compareDates(scrim) > 0;
      if (gameHasStarted) {
        setGameStarted(scrim._id);
      }
    }
  }, [scrim]);
  
  // Check player/caster status
  useEffect(() => {
    if (!scrim || !currentUser) return;
    
    const { teamOne = [], teamTwo = [], casters = [] } = scrim;
    const teams = [...teamOne, ...teamTwo];
    
    const playerInGame = teams.find(
      (player) => player?._user?._id === currentUser._id
    );
    setPlayerEntered(playerInGame);
    
    const casterInGame = casters.find(
      (caster) => caster?._id === currentUser._id
    );
    setCasterEntered(casterInGame);
  }, [scrim, currentUser]);
  
  // Check for uploaded images
  useEffect(() => {
    if (!scrim) return;
    
    const teamImages = [...(scrim.teamOneImages || []), ...(scrim.teamTwoImages || [])];
    setImageUploaded(teamImages.length > 0);
  }, [scrim]);
  
  const gameEnded = useMemo(() => scrim?.teamWon, [scrim?.teamWon]);
  
  // Team data
  const { teamOne = [], teamTwo = [], casters = [] } = scrim || {};
  
  // Join game handler
  const joinGame = async (teamJoiningName, role) => {
    if (!currentUser || !scrimId) return;
    
    setButtonsDisabled(true);
    
    if (casterEntered) {
      setCurrentAlert({
        type: 'Error',
        message: (
          <span>
            cannot join team:&nbsp;
            <strong>You're already a caster for this game!</strong>
          </span>
        ),
      });
      setButtonsDisabled(false);
      return;
    }
    
    await joinTeam(
      scrimId,
      currentUser._id,
      teamJoiningName,
      role,
      setCurrentAlert,
      setButtonsDisabled
    );
    
    setButtonsDisabled(false);
  };
  
  // Leave game handler
  const leaveGame = async () => {
    if (!playerEntered || !scrimId) return;
    
    setButtonsDisabled(true);
    await leaveTeam(
      scrimId,
      playerEntered._user._id,
      setCurrentAlert,
      setButtonsDisabled
    );
    setButtonsDisabled(false);
  };
  
  // Move player handler
  const handleMovePlayer = async (teamName, role) => {
    if (!currentUser || !scrimId) return;
    
    setButtonsDisabled(true);
    await movePlayer(
      scrimId,
      currentUser._id,
      teamName,
      role,
      setCurrentAlert,
      setButtonsDisabled
    );
    setButtonsDisabled(false);
  };
  
  // Caster actions
  const joinCast = async () => {
    if (!currentUser || !scrimId) return;
    
    setButtonsDisabled(true);
    
    if (playerEntered) {
      setCurrentAlert({
        type: 'Error',
        message: (
          <span>
            cannot join cast:&nbsp;
            <strong>You're already a player in this game!</strong>
          </span>
        ),
      });
      setButtonsDisabled(false);
      return;
    }
    
    const updatedScrim = await insertCasterInScrim({
      scrimId,
      casterId: currentUser._id,
      setAlert: setCurrentAlert,
      setButtonsDisabled,
      setScrim: (scrim) => setScrim(scrimId, scrim),
    });
    
    if (updatedScrim?.createdBy) {
      socket?.emit('sendScrimTransaction', updatedScrim);
    }
    
    setButtonsDisabled(false);
  };
  
  const leaveCast = async () => {
    if (!casterEntered || !scrimId) return;
    
    setButtonsDisabled(true);
    
    const updatedScrim = await removeCasterFromScrim({
      scrimId,
      casterId: casterEntered._id,
      setAlert: setCurrentAlert,
      setButtonsDisabled,
      setScrim: (scrim) => setScrim(scrimId, scrim),
    });
    
    if (updatedScrim?.createdBy) {
      socket?.emit('sendScrimTransaction', updatedScrim);
    }
    
    setButtonsDisabled(false);
  };
  
  // Delete scrim handler
  const handleDeleteScrim = async () => {
    if (!scrimId) return;
    
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this scrim?'
    );
    
    if (!confirmDelete) return;
    
    const success = await deleteScrimAction(scrimId, setCurrentAlert);
    
    if (success) {
      setCurrentAlert({
        type: 'Success',
        message: 'Scrim removed successfully',
      });
      
      if (isInDetail) {
        history.push('/');
      }
    }
  };
  
  // Don't render if no scrim data
  if (!scrim) return null;
  
  return (
    <PageSection aria-label="scrim section">
      <div className={classes.scrimBox} ref={scrimBoxRef}>
        <ScrimSectionHeader
          scrim={scrim}
          setScrim={(updatedScrim) => setScrim(scrimId, updatedScrim)}
          socket={socket}
          joinCast={joinCast}
          leaveCast={leaveCast}
          handleDeleteScrim={handleDeleteScrim}
          gameEnded={gameEnded}
          casterEntered={casterEntered}
          buttonsDisabled={buttonsDisabled}
          isBoxExpanded={isBoxExpanded}
          isInDetail={isInDetail}
        />
        
        {isBoxExpanded && (
          <>
            <ScrimTeamList
              teamData={{
                teamRoles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
                teamName: 'teamOne',
                teamTitleName: 'Team One (Blue Side)',
                teamArray: teamOne,
              }}
              scrim={scrim}
              setScrim={(updatedScrim) => setScrim(scrimId, updatedScrim)}
              socket={socket}
              playerEntered={playerEntered}
              casterEntered={casterEntered}
              gameStarted={gameStarted === scrim._id}
              buttonsDisabled={buttonsDisabled}
              setButtonsDisabled={setButtonsDisabled}
              setSwapPlayers={setSwapPlayers}
              joinGame={joinGame}
              leaveGame={leaveGame}
              handleMovePlayer={handleMovePlayer}
            />
            
            <ScrimSectionMiddleAreaBox
              imageUploaded={imageUploaded}
              scrim={scrim}
              setScrim={(updatedScrim) => setScrim(scrimId, updatedScrim)}
              gameStarted={gameStarted === scrim._id}
              setGameStarted={setGameStarted}
              gameEnded={gameEnded}
              playerEntered={playerEntered}
              casterEntered={casterEntered}
              socket={socket}
            />
            
            <ScrimTeamList
              teamData={{
                teamRoles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
                teamName: 'teamTwo',
                teamTitleName: 'Team Two (Red Side)',
                teamArray: teamTwo,
              }}
              scrim={scrim}
              setScrim={(updatedScrim) => setScrim(scrimId, updatedScrim)}
              socket={socket}
              playerEntered={playerEntered}
              casterEntered={casterEntered}
              gameStarted={gameStarted === scrim._id}
              buttonsDisabled={buttonsDisabled}
              setButtonsDisabled={setButtonsDisabled}
              setSwapPlayers={setSwapPlayers}
              joinGame={joinGame}
              leaveGame={leaveGame}
              handleMovePlayer={handleMovePlayer}
            />
          </>
        )}
        
        {!isInDetail && (
          <ScrimSectionExpander
            scrimBoxRef={scrimBoxRef}
            isBoxExpanded={isBoxExpanded}
            setIsBoxExpanded={setIsBoxExpanded}
            scrimId={scrim._id}
          />
        )}
      </div>
    </PageSection>
  );
}