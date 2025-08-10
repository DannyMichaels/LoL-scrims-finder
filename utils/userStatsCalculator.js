const calculateUserStats = (userParticipatedScrims, userId) => {
  if (!userParticipatedScrims || userParticipatedScrims.length === 0) {
    return {
      userExp: 0,
      userLevel: 1,
      userWinrate: 0,
      userGamesPlayedCount: 0,
      userGamesCastedCount: 0,
    };
  }

  let expResult = 0;
  let gamesPlayedCount = 0;
  let gamesCastedCount = 0;
  let playerWinsCount = 0;
  let playerLossCount = 0;

  for (let i = 0; i < userParticipatedScrims.length; i++) {
    const scrim = userParticipatedScrims[i];

    // if scrim doesn't have a winning team, skip this and go to the next scrim
    if (!scrim.teamWon) continue;

    const scrimTeams = [...scrim.teamOne, ...scrim.teamTwo];

    const foundPlayer = scrimTeams.find(
      (player) => player._user.toString() === userId.toString()
    );

    // without using populate the array of casters is just an array of ids
    const foundCaster = scrim.casters.find(
      (casterId) => casterId.toString() === userId.toString()
    );

    if (foundCaster) {
      expResult += 1; // one point for casting
      gamesCastedCount += 1;
      continue; // skip other operations if the player is a caster
    }

    if (foundPlayer) {
      gamesPlayedCount += 1;

      const playerTeamName = foundPlayer?.team?.name; // teamOne, teamTwo.
      const winnerTeamName = scrim?.teamWon;
      const playerWon = winnerTeamName === playerTeamName;

      if (playerWon) {
        expResult += 3; // 3 points for winning
        playerWinsCount += 1;
      } else {
        expResult += 0.5; // half points for losing
        playerLossCount += 1;
      }
    }
  }

  // Calculate winrate
  let winRateResult;
  if (gamesPlayedCount === 0) {
    winRateResult = 0;
  } else {
    winRateResult = Math.floor(
      (playerWinsCount / (playerWinsCount + playerLossCount)) * 100
    );
  }

  // Calculate level based on EXP
  let userLevel = 1;
  for (let i = 1; i < expResult; i++) {
    if (i % 10 === 0) userLevel += 1;
  }

  // Calculate progress to next level
  const currentLevelExp = (userLevel - 1) * 10;
  const nextLevelExp = userLevel * 10;
  const expProgress = expResult - currentLevelExp;
  const expNeeded = 10;
  const expProgressPercent = expResult === 0 ? 0 : Math.floor((expProgress / expNeeded) * 100);

  return {
    userExp: expResult,
    userLevel,
    userWinrate: winRateResult,
    userGamesPlayedCount: gamesPlayedCount,
    userGamesCastedCount: gamesCastedCount,
    expProgress,
    expNeeded,
    expProgressPercent,
  };
};

module.exports = { calculateUserStats };