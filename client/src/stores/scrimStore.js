import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  getScrimById,
  insertPlayerInScrim,
  removePlayerFromScrim,
  movePlayerInScrim,
  insertCasterInScrim,
  removeCasterFromScrim,
  deleteScrim,
  adminAssignPlayer,
  adminFillRandomPositions,
  setScrimWinner
} from '../services/scrims.services';

const useScrimStore = create(
  devtools(
    (set, get) => ({
      // State
      scrims: {},  // Object with scrimId as key for O(1) lookups
      expandedScrims: new Set(), // Track which scrims are expanded
      activeScrimRooms: new Set(), // Track which scrim rooms we've joined
      socketRef: null,
      
      // Actions
      setSocket: (socket) => {
        set({ socketRef: socket });
        
        if (!socket) return;
        
        // Set up socket event listeners
        socket.on('scrim_updated', (data) => {
          const scrim = data?.scrim || data;
          if (scrim?._id) {
            get().updateScrim(scrim._id, scrim);
          }
        });
        
        socket.on('getScrimTransaction', (data) => {
          const scrim = data?.scrim || data;
          if (scrim?._id) {
            get().updateScrim(scrim._id, scrim);
          }
        });
        
        socket.on('scrimUpdate', (scrim) => {
          if (scrim?._id) {
            get().updateScrim(scrim._id, scrim);
          }
        });
        
        socket.on('tournamentInitialized', (data) => {
          if (data?.scrimId) {
            get().updateScrimTournament(data.scrimId, {
              tournamentCode: data.tournamentCode,
              providerId: data.providerId,
              tournamentId: data.tournamentId,
              setupCompleted: true,
              lobbyCreated: true,
              lobbyName: data.tournamentCode
            });
          }
        });
        
        socket.on('tournamentSkipped', (data) => {
          console.log('Tournament skipped:', data);
        });
        
        socket.on('tournamentError', (data) => {
          console.error('Tournament error:', data);
        });
      },
      
      // Set or update a scrim
      setScrim: (scrimId, scrimData) => {
        set((state) => ({
          scrims: {
            ...state.scrims,
            [scrimId]: scrimData
          }
        }));
      },
      
      // Update specific scrim fields
      updateScrim: (scrimId, updates) => {
        set((state) => ({
          scrims: {
            ...state.scrims,
            [scrimId]: {
              ...state.scrims[scrimId],
              ...updates
            }
          }
        }));
      },
      
      // Update tournament data for a scrim
      updateScrimTournament: (scrimId, tournamentData) => {
        set((state) => ({
          scrims: {
            ...state.scrims,
            [scrimId]: {
              ...state.scrims[scrimId],
              riotTournament: tournamentData,
              lobbyName: tournamentData.tournamentCode || state.scrims[scrimId]?.lobbyName
            }
          }
        }));
      },
      
      // Get a specific scrim
      getScrim: (scrimId) => {
        return get().scrims[scrimId];
      },
      
      // Fetch scrim from API if needed
      fetchScrim: async (scrimId) => {
        try {
          const scrim = await getScrimById(scrimId);
          if (scrim?.createdBy) {
            get().setScrim(scrimId, scrim);
            return scrim;
          }
        } catch (error) {
          console.error('Error fetching scrim:', error);
        }
        return null;
      },
      
      // Toggle scrim expansion
      toggleScrimExpanded: (scrimId, isExpanded) => {
        set((state) => {
          const newExpanded = new Set(state.expandedScrims);
          if (isExpanded) {
            newExpanded.add(scrimId);
          } else {
            newExpanded.delete(scrimId);
          }
          return { expandedScrims: newExpanded };
        });
      },
      
      // Check if scrim is expanded
      isScrimExpanded: (scrimId) => {
        return get().expandedScrims.has(scrimId);
      },
      
      // Join scrim room for socket updates
      joinScrimRoom: (scrimId) => {
        const socket = get().socketRef;
        const activeRooms = get().activeScrimRooms;
        
        if (socket && !activeRooms.has(scrimId)) {
          socket.emit('join_scrim_room', { scrimId });
          set((state) => {
            const newRooms = new Set(state.activeScrimRooms);
            newRooms.add(scrimId);
            return { activeScrimRooms: newRooms };
          });
        }
      },
      
      // Leave scrim room
      leaveScrimRoom: (scrimId) => {
        const socket = get().socketRef;
        const activeRooms = get().activeScrimRooms;
        
        if (socket && activeRooms.has(scrimId)) {
          socket.emit('leave_scrim_room', { scrimId });
          set((state) => {
            const newRooms = new Set(state.activeScrimRooms);
            newRooms.delete(scrimId);
            return { activeScrimRooms: newRooms };
          });
        }
      },
      
      // Player actions
      joinTeam: async (scrimId, userId, teamName, role, setAlert, setButtonsDisabled) => {
        try {
          const updatedScrim = await insertPlayerInScrim({
            scrimId,
            userId,
            playerData: { role, team: { name: teamName } },
            setAlert,
            setButtonsDisabled,
            setScrim: (scrim) => get().setScrim(scrimId, scrim)
          });
          
          if (updatedScrim?.createdBy) {
            get().setScrim(scrimId, updatedScrim);
            get().socketRef?.emit('sendScrimTransaction', updatedScrim);
            return updatedScrim;
          }
        } catch (error) {
          console.error('Error joining team:', error);
        }
        return null;
      },
      
      leaveTeam: async (scrimId, userId, setAlert, setButtonsDisabled) => {
        try {
          const updatedScrim = await removePlayerFromScrim({
            scrimId,
            userId,
            setAlert,
            setButtonsDisabled,
            setScrim: (scrim) => get().setScrim(scrimId, scrim)
          });
          
          if (updatedScrim?.createdBy) {
            get().setScrim(scrimId, updatedScrim);
            get().socketRef?.emit('sendScrimTransaction', updatedScrim);
            return updatedScrim;
          }
        } catch (error) {
          console.error('Error leaving team:', error);
        }
        return null;
      },
      
      movePlayer: async (scrimId, userId, teamName, role, setAlert, setButtonsDisabled) => {
        try {
          const updatedScrim = await movePlayerInScrim({
            scrimId,
            userId,
            playerData: { role, team: { name: teamName } },
            setAlert,
            setButtonsDisabled,
            setScrim: (scrim) => get().setScrim(scrimId, scrim)
          });
          
          if (updatedScrim?.createdBy) {
            get().setScrim(scrimId, updatedScrim);
            get().socketRef?.emit('sendScrimTransaction', updatedScrim);
            return updatedScrim;
          }
        } catch (error) {
          console.error('Error moving player:', error);
        }
        return null;
      },
      
      // Caster actions
      joinCast: async (scrimId, userId, setAlert, setButtonsDisabled) => {
        try {
          const updatedScrim = await insertCasterInScrim({
            scrimId,
            casterId: userId,
            setAlert,
            setButtonsDisabled,
            setScrim: (scrim) => get().setScrim(scrimId, scrim)
          });
          
          if (updatedScrim?.createdBy) {
            get().setScrim(scrimId, updatedScrim);
            get().socketRef?.emit('sendScrimTransaction', updatedScrim);
            return updatedScrim;
          }
        } catch (error) {
          console.error('Error joining cast:', error);
        }
        return null;
      },
      
      leaveCast: async (scrimId, userId, setAlert, setButtonsDisabled) => {
        try {
          const updatedScrim = await removeCasterFromScrim({
            scrimId,
            casterId: userId,
            setAlert,
            setButtonsDisabled,
            setScrim: (scrim) => get().setScrim(scrimId, scrim)
          });
          
          if (updatedScrim?.createdBy) {
            get().setScrim(scrimId, updatedScrim);
            get().socketRef?.emit('sendScrimTransaction', updatedScrim);
            return updatedScrim;
          }
        } catch (error) {
          console.error('Error leaving cast:', error);
        }
        return null;
      },
      
      // Admin actions
      adminAssignPlayer: async (scrimId, userId, teamName, role, setAlert) => {
        try {
          const updatedScrim = await adminAssignPlayer({
            scrimId,
            userId,
            teamName,
            role,
            setAlert,
            setButtonsDisabled: () => {},
            setScrim: (scrim) => get().setScrim(scrimId, scrim)
          });
          
          if (updatedScrim) {
            get().setScrim(scrimId, updatedScrim);
            get().socketRef?.emit('sendScrimTransaction', updatedScrim);
            return updatedScrim;
          }
        } catch (error) {
          console.error('Error assigning player:', error);
        }
        return null;
      },
      
      adminFillRandom: async (scrimId, region, setAlert) => {
        try {
          const result = await adminFillRandomPositions({
            scrimId,
            region,
            setAlert,
            setButtonsDisabled: () => {},
            setScrim: (scrim) => get().setScrim(scrimId, scrim)
          });
          
          if (result?.scrim) {
            get().setScrim(scrimId, result.scrim);
            get().socketRef?.emit('sendScrimTransaction', result.scrim);
            return result;
          }
        } catch (error) {
          console.error('Error filling random positions:', error);
        }
        return null;
      },
      
      deleteScrim: async (scrimId, setAlert) => {
        try {
          await deleteScrim({
            scrimId,
            setAlert
          });
          
          // Remove from store
          set((state) => {
            const newScrims = { ...state.scrims };
            delete newScrims[scrimId];
            
            const newExpanded = new Set(state.expandedScrims);
            newExpanded.delete(scrimId);
            
            return { 
              scrims: newScrims,
              expandedScrims: newExpanded
            };
          });
          
          return true;
        } catch (error) {
          console.error('Error deleting scrim:', error);
          return false;
        }
      },
      
      // Clear store
      clearStore: () => {
        set({
          scrims: {},
          expandedScrims: new Set(),
          activeScrimRooms: new Set()
        });
      }
    }),
    {
      name: 'scrim-store'
    }
  )
);

export default useScrimStore;