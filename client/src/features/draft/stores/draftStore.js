import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getTurnLabel } from '../utils/draftSequence';

const useDraftStore = create(
  devtools(
    (set, get) => ({
      // State
      draft: null,
      champions: [],
      championsVersion: null,
      championsLoaded: false,
      selectedChampion: null,
      searchQuery: '',
      activeRoleFilter: null,
      myTeam: null, // 'blue' | 'red' | null (spectator)
      myRole: null,
      timerExpiresAt: null,
      swapSelectedSlot: null, // { slot: number } for first pick in swap

      // Setters
      setDraft: (draft) => set({ draft }),

      setChampions: (champions, version) =>
        set({ champions, championsVersion: version, championsLoaded: true }),

      setSelectedChampion: (champion) => set({ selectedChampion: champion }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setActiveRoleFilter: (role) =>
        set((state) => ({
          activeRoleFilter: state.activeRoleFilter === role ? null : role,
        })),

      setMyTeam: (team) => set({ myTeam: team }),
      setMyRole: (role) => set({ myRole: role }),
      setTimerExpiresAt: (expiresAt) => set({ timerExpiresAt: expiresAt }),
      setSwapSelectedSlot: (slot) => set({ swapSelectedSlot: slot }),

      // Apply an action update from the server
      applyActionUpdate: (update) =>
        set((state) => {
          if (!state.draft) return state;

          const newDraft = { ...state.draft };
          newDraft.currentActionIndex = update.currentActionIndex;

          // Update specific action
          if (update.action) {
            const actions = [...newDraft.actions];
            const idx = actions.findIndex(
              (a) => a.actionIndex === update.action.actionIndex
            );
            if (idx !== -1) {
              actions[idx] = { ...actions[idx], ...update.action };
            }
            newDraft.actions = actions;

            // Assign champion to player slot for picks
            const act = update.action;
            if (act.type === 'pick' && act.championId) {
              const teamKey = act.team === 'blue' ? 'blueTeam' : 'redTeam';
              const team = { ...newDraft[teamKey] };
              const players = [...team.players];

              if (newDraft.mode === 'captain') {
                // Captain mode: fill slots in order of completed picks
                const filledCount = actions.filter(
                  (a) =>
                    a.type === 'pick' &&
                    a.team === act.team &&
                    a.completedAt &&
                    a.actionIndex < act.actionIndex
                ).length;
                if (players[filledCount]) {
                  players[filledCount] = {
                    ...players[filledCount],
                    champion: act.championId,
                  };
                }
              } else if (act.playerSlot != null) {
                // Individual mode: specific player slot
                const pIdx = players.findIndex(
                  (p) => p.slot === act.playerSlot
                );
                if (pIdx !== -1) {
                  players[pIdx] = {
                    ...players[pIdx],
                    champion: act.championId,
                  };
                }
              }

              team.players = players;
              newDraft[teamKey] = team;
            }
          }

          // Handle revealed bans (individual mode simultaneous)
          if (update.revealedBans) {
            const actions = [...newDraft.actions];
            for (const ban of update.revealedBans) {
              const idx = actions.findIndex(
                (a) =>
                  a.type === 'ban' &&
                  a.team === ban.team &&
                  a.playerSlot === ban.playerSlot &&
                  !a.completedAt
              );
              if (idx !== -1) {
                actions[idx] = {
                  ...actions[idx],
                  championId: ban.championId,
                  championName: ban.championName,
                  completedAt: new Date().toISOString(),
                };
              }
            }
            newDraft.actions = actions;
          }

          return { draft: newDraft, selectedChampion: null };
        }),

      clearDraft: () =>
        set({
          draft: null,
          selectedChampion: null,
          searchQuery: '',
          activeRoleFilter: null,
          myTeam: null,
          myRole: null,
          timerExpiresAt: null,
          swapSelectedSlot: null,
        }),

      // Derived getters
      getCurrentAction: () => {
        const { draft } = get();
        if (!draft || !draft.actions) return null;
        return draft.actions[draft.currentActionIndex] || null;
      },

      isMyTurn: () => {
        const { draft, myTeam } = get();
        if (!draft || !myTeam || draft.status !== 'in_progress') return false;
        const currentAction = draft.actions[draft.currentActionIndex];
        if (!currentAction) return false;
        return currentAction.team === myTeam;
      },

      getTurnLabel: () => {
        const { draft } = get();
        if (!draft) return '';
        const currentAction = draft.actions[draft.currentActionIndex];
        return getTurnLabel(currentAction);
      },

      getAvailableChampions: () => {
        const { draft, champions, searchQuery, activeRoleFilter } = get();
        if (!champions.length) return [];

        // Build set of unavailable champion IDs
        const unavailable = new Set();
        if (draft?.actions) {
          for (const action of draft.actions) {
            if (action.championId && action.completedAt) {
              unavailable.add(action.championId);
            }
          }
        }

        // Fearless locked
        if (draft?.previouslyPickedChampions) {
          for (const prev of draft.previouslyPickedChampions) {
            if (draft.fearlessMode === 'hard') {
              unavailable.add(prev.championId);
            } else if (draft.fearlessMode === 'soft') {
              // Soft fearless: only locked for the same team
              // We show them with a lock icon but don't remove from grid
            }
          }
        }

        let filtered = champions;

        // Role filter
        if (activeRoleFilter) {
          const roleMap = {
            Top: ['Fighter', 'Tank'],
            Jungle: ['Fighter', 'Assassin', 'Tank'],
            Mid: ['Mage', 'Assassin'],
            ADC: ['Marksman'],
            Support: ['Support', 'Mage', 'Tank'],
          };
          const tags = roleMap[activeRoleFilter] || [];
          if (tags.length) {
            filtered = filtered.filter((c) =>
              c.tags.some((t) => tags.includes(t))
            );
          }
        }

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter((c) =>
            c.name.toLowerCase().includes(query)
          );
        }

        // Mark availability
        return filtered.map((c) => ({
          ...c,
          available: !unavailable.has(c.id),
          fearlessLocked: draft?.previouslyPickedChampions?.some(
            (p) => p.championId === c.id
          ),
        }));
      },
    }),
    { name: 'draftStore' }
  )
);

export default useDraftStore;
