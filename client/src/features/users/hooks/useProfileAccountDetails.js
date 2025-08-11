import { useState, useEffect } from 'react';

/**
 * @method useProfileAccountDetails
 * @returns {Object} User stats object containing all profile statistics
 */
export default function useProfileAccountDetails(userParticipatedScrims, user, stats) {
  const [userStats, setUserStats] = useState({
    userExp: 0,
    userLevel: 1,
    userWinrate: 0,
    userGamesPlayedCount: 0,
    userGamesCastedCount: 0,
    expProgress: 0,
    expNeeded: 10,
    expProgressPercent: 0,
  });

  useEffect(() => {
    // Use stats passed from UserProfile if available
    if (stats) {
      setUserStats({
        userExp: stats.userExp || 0,
        userLevel: stats.userLevel || 1,
        userWinrate: stats.userWinrate || 0,
        userGamesPlayedCount: stats.userGamesPlayedCount || 0,
        userGamesCastedCount: stats.userGamesCastedCount || 0,
        expProgress: stats.expProgress || 0,
        expNeeded: stats.expNeeded || 10,
        expProgressPercent: stats.expProgressPercent || 0,
      });
    }

    return () => {
      setUserStats({
        userExp: 0,
        userLevel: 1,
        userWinrate: 0,
        userGamesPlayedCount: 0,
        userGamesCastedCount: 0,
        expProgress: 0,
        expNeeded: 10,
        expProgressPercent: 0,
      });
    };
  }, [stats]);

  return userStats;
}
