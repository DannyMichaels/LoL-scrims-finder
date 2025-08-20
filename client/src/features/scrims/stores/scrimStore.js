import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import moment from 'moment';
import { formatDateForAPI, getUserTimezone } from '@/utils/timezone';
import {
  getScrimById,
  insertPlayerInScrim,
  removePlayerFromScrim,
  movePlayerInScrim,
  insertCasterInScrim,
  removeCasterFromScrim,
  deleteScrim,
  createScrim,
  updateScrim,
  adminAssignPlayer,
  adminFillRandomPositions,
  setScrimWinner,
  swapPlayersInScrim,
  getAllScrims,
} from '@/features/scrims/services/scrims.services';

const useScrimStore = create(
  devtools(
    (set, get) => ({
      // State
      scrims: {}, // Object with scrimId as key for O(1) lookups
      allScrimsArray: [], // Array of all scrims for filtering
      scrimsLoaded: false,
      expandedScrims: new Set(), // Track which scrims are expanded
      activeScrimRooms: new Set(), // Track which scrim rooms we've joined
      openScrimChats: new Set(), // Track which scrim chats are currently open
      unreadScrimMessages: {}, // Track unread message count per scrimId
      socketRef: null,

      // Filter state
      scrimsDate: moment().format('YYYY-MM-DD'), // Store as string to prevent re-renders
      scrimsRegion: 'NA',
      showPreviousScrims: true,
      showCurrentScrims: true,
      showUpcomingScrims: true,

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
              lobbyName: data.tournamentCode,
            });
          }
        });

        socket.on('tournamentSkipped', (data) => {
          console.log('Tournament skipped:', data);
        });

        socket.on('tournamentError', (data) => {
          console.error('Tournament error:', data);
        });

        // Listen for scrim messages to track unread count
        socket.on('getScrimMessage', (data) => {
          const conversationId = data._conversation; // scrim conversation ID
          const senderId = data.senderId;
          
          if (conversationId && senderId) {
            // Only increment unread count if the scrim chat is NOT currently open
            const isChatOpen = get().openScrimChats.has(conversationId);
            
            if (!isChatOpen) {
              set((state) => ({
                unreadScrimMessages: {
                  ...state.unreadScrimMessages,
                  [conversationId]: (state.unreadScrimMessages[conversationId] || 0) + 1,
                },
              }));
            }
          }
        });
      },

      // Set or update a scrim
      setScrim: (scrimId, scrimData) => {
        set((state) => ({
          scrims: {
            ...state.scrims,
            [scrimId]: scrimData,
          },
        }));
      },

      // Update specific scrim fields
      updateScrim: (scrimId, updates) => {
        set((state) => {
          const updatedScrim = {
            ...state.scrims[scrimId],
            ...updates,
          };

          return {
            scrims: {
              ...state.scrims,
              [scrimId]: updatedScrim,
            },
            allScrimsArray: state.allScrimsArray.map((s) =>
              s._id === scrimId ? updatedScrim : s
            ),
          };
        });
      },

      // Update tournament data for a scrim
      updateScrimTournament: (scrimId, tournamentData) => {
        set((state) => {
          const updatedScrim = {
            ...state.scrims[scrimId],
            riotTournament: tournamentData,
            lobbyName:
              tournamentData.tournamentCode || state.scrims[scrimId]?.lobbyName,
          };

          return {
            scrims: {
              ...state.scrims,
              [scrimId]: updatedScrim,
            },
            allScrimsArray: state.allScrimsArray.map((s) =>
              s._id === scrimId ? updatedScrim : s
            ),
          };
        });
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
      joinTeam: async (
        scrimId,
        userId,
        teamName,
        role,
        setAlert,
        setButtonsDisabled
      ) => {
        try {
          const updatedScrim = await insertPlayerInScrim({
            scrimId,
            userId,
            playerData: { role, team: { name: teamName } },
            setAlert,
            setButtonsDisabled,
            setScrim: (scrim) => get().setScrim(scrimId, scrim),
          });

          if (updatedScrim?.createdBy) {
            get().setScrim(scrimId, updatedScrim);
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
            setScrim: (scrim) => get().setScrim(scrimId, scrim),
          });

          if (updatedScrim?.createdBy) {
            get().setScrim(scrimId, updatedScrim);
            // Socket event is now handled automatically by the backend API
            return updatedScrim;
          }
        } catch (error) {
          console.error('Error leaving team:', error);
        }
        return null;
      },

      movePlayer: async (
        scrimId,
        userId,
        teamName,
        role,
        setAlert,
        setButtonsDisabled
      ) => {
        try {
          const updatedScrim = await movePlayerInScrim({
            scrimId,
            userId,
            playerData: { role, team: { name: teamName } },
            setAlert,
            setButtonsDisabled,
            setScrim: (scrim) => get().setScrim(scrimId, scrim),
          });

          if (updatedScrim?.createdBy) {
            get().setScrim(scrimId, updatedScrim);
            // Socket event is now handled automatically by the backend API
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
            setScrim: (scrim) => get().setScrim(scrimId, scrim),
          });

          if (updatedScrim?.createdBy) {
            get().setScrim(scrimId, updatedScrim);
            // Socket event is now handled automatically by the backend API
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
            setScrim: (scrim) => get().setScrim(scrimId, scrim),
          });

          if (updatedScrim?.createdBy) {
            get().setScrim(scrimId, updatedScrim);
            // Socket event is now handled automatically by the backend API
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
            setScrim: (scrim) => get().setScrim(scrimId, scrim),
          });

          if (updatedScrim) {
            get().setScrim(scrimId, updatedScrim);
            // Socket event is now handled automatically by the backend API
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
            setScrim: (scrim) => get().setScrim(scrimId, scrim),
          });

          if (result?.scrim) {
            get().setScrim(scrimId, result.scrim);
            // Socket event is now handled automatically by the backend API
            return result;
          }
        } catch (error) {
          console.error('Error filling random positions:', error);
        }
        return null;
      },

      setWinner: async (scrimId, winnerTeamName, setAlert) => {
        try {
          const updatedScrim = await setScrimWinner(
            scrimId,
            winnerTeamName,
            setAlert
          );

          if (updatedScrim) {
            // Update in store
            set((state) => {
              const newScrims = { ...state.scrims };
              newScrims[scrimId] = updatedScrim;

              const newScrimsArray = state.allScrimsArray.map((s) =>
                s._id === scrimId ? updatedScrim : s
              );

              return {
                scrims: newScrims,
                allScrimsArray: newScrimsArray,
              };
            });

            // Socket event is now handled automatically by the backend API
            return updatedScrim;
          }
        } catch (error) {
          console.error('Error setting scrim winner:', error);
        }
        return null;
      },

      swapPlayers: async (
        scrimId,
        swapPlayers,
        setAlert,
        setButtonsDisabled
      ) => {
        try {
          const updatedScrim = await swapPlayersInScrim({
            scrimId,
            swapPlayers,
            setButtonsDisabled,
            setAlert,
            setScrim: (scrim) => get().setScrim(scrimId, scrim),
          });

          if (updatedScrim) {
            get().setScrim(scrimId, updatedScrim);
            // Socket event is now handled automatically by the backend API
            return updatedScrim;
          }
        } catch (error) {
          console.error('Error swapping players:', error);
        }
        return null;
      },

      createScrim: async (scrimData, setAlert) => {
        try {
          const newScrim = await createScrim(scrimData, setAlert);

          if (newScrim) {
            // Add to store
            set((state) => ({
              scrims: { ...state.scrims, [newScrim._id]: newScrim },
              allScrimsArray: [...state.allScrimsArray, newScrim],
            }));

            // Set the date filter to match the new scrim
            const scrimDate = moment(newScrim.gameStartTime).format(
              'YYYY-MM-DD'
            );
            set({
              scrimsDate: scrimDate,
              scrimsRegion: newScrim.region,
            });

            return newScrim;
          }
        } catch (error) {
          console.error('Error creating scrim:', error);
          const errorMsg =
            error?.response?.data?.error || 'Failed to create scrim';
          if (setAlert) {
            setAlert({
              type: 'Error',
              message: errorMsg,
            });
          }
        }
        return null;
      },

      updateScrimFromAPI: async (scrimId, scrimData, setAlert) => {
        try {
          const updatedScrim = await updateScrim(scrimId, scrimData);

          if (updatedScrim) {
            // Update in store
            set((state) => {
              const newScrims = { ...state.scrims };
              newScrims[scrimId] = updatedScrim;

              const newScrimsArray = state.allScrimsArray.map((s) =>
                s._id === scrimId ? updatedScrim : s
              );

              return {
                scrims: newScrims,
                allScrimsArray: newScrimsArray,
              };
            });

            return updatedScrim;
          }
        } catch (error) {
          console.error('Error updating scrim:', error);
          const errorMsg =
            error?.response?.data?.error || 'Failed to update scrim';
          if (setAlert) {
            setAlert({
              type: 'Error',
              message: errorMsg,
            });
          }
        }
        return null;
      },

      deleteScrim: async (scrimId, setAlert) => {
        try {
          await deleteScrim(scrimId);

          // Remove from store
          set((state) => {
            const newScrims = { ...state.scrims };
            delete newScrims[scrimId];

            const newExpanded = new Set(state.expandedScrims);
            newExpanded.delete(scrimId);

            // Also remove from the array
            const newScrimsArray = state.allScrimsArray.filter(
              (s) => s._id !== scrimId
            );

            return {
              scrims: newScrims,
              allScrimsArray: newScrimsArray,
              expandedScrims: newExpanded,
            };
          });

          return true;
        } catch (error) {
          console.error('Error deleting scrim:', error);
          const errorMsg =
            error?.response?.data?.error || 'Failed to delete scrim';
          if (setAlert) {
            setAlert({
              type: 'Error',
              message: errorMsg,
            });
          }
          return false;
        }
      },

      // Fetch all scrims for a region and date
      fetchAllScrims: async (region, date) => {
        try {
          const params = {};
          if (region) params.region = region;
          if (date) {
            // Convert user's date to UTC date range for proper filtering
            const { startDate, endDate } = formatDateForAPI(date);
            params.startDate = startDate;
            params.endDate = endDate;
          }

          const scrims = await getAllScrims(params);

          // Convert array to object for O(1) lookups
          const scrimsObj = {};
          scrims.forEach((scrim) => {
            scrimsObj[scrim._id] = scrim;
          });

          set({
            scrims: scrimsObj,
            allScrimsArray: scrims,
            scrimsLoaded: true,
            scrimsRegion: region || get().scrimsRegion,
            scrimsDate: date || get().scrimsDate, // date is already a string
          });

          return scrims;
        } catch (error) {
          console.error('Error fetching scrims:', error);
          set({ scrimsLoaded: true }); // Set loaded even on error
          return [];
        }
      },

      // Filter setters
      setScrimsDate: (date) => {
        // Store the date string but ensure it's in user's timezone context
        const userTz = getUserTimezone();
        const dateString = moment.tz(date, userTz).format('YYYY-MM-DD');
        set({ scrimsDate: dateString });
      },
      setScrimsRegion: (region) => set({ scrimsRegion: region }),
      setShowPreviousScrims: (show) => set({ showPreviousScrims: show }),
      setShowCurrentScrims: (show) => set({ showCurrentScrims: show }),
      setShowUpcomingScrims: (show) => set({ showUpcomingScrims: show }),

      // Scrim chat management
      setScrimChatOpen: (conversationId, isOpen) => {
        set((state) => {
          const newOpenChats = new Set(state.openScrimChats);
          if (isOpen) {
            newOpenChats.add(conversationId);
          } else {
            newOpenChats.delete(conversationId);
          }
          return { openScrimChats: newOpenChats };
        });
      },

      isScrimChatOpen: (conversationId) => {
        return get().openScrimChats.has(conversationId);
      },

      // Unread message management
      getUnreadScrimMessageCount: (scrimId) => {
        return get().unreadScrimMessages[scrimId] || 0;
      },

      markScrimMessagesAsRead: (scrimId) => {
        set((state) => {
          const newUnreadMessages = { ...state.unreadScrimMessages };
          delete newUnreadMessages[scrimId];
          return { unreadScrimMessages: newUnreadMessages };
        });
      },

      // Close all scrim chats (called when any modal closes)
      closeAllScrimChats: () => {
        set({
          openScrimChats: new Set(),
        });
      },

      // Clear store
      clearStore: () => {
        set({
          scrims: {},
          allScrimsArray: [],
          scrimsLoaded: false,
          expandedScrims: new Set(),
          activeScrimRooms: new Set(),
          openScrimChats: new Set(),
          unreadScrimMessages: {},
        });
      },
    }),
    {
      name: 'scrim-store',
    }
  )
);

export default useScrimStore;
