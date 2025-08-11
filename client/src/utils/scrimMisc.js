/**
 * @method getTeamBackgroundColor
 * for ScrimTeamList to render background color for winner/loser
 * @param {String} teamName
 * @param {String} winnerTeamName ex: teamOne, teamTwo
 * @returns {{normal: string, gradient: string}}
 */
export const getTeamBackgroundColor = (teamName, winnerTeamName) => {
  const initialState = {
    normal: 'inherit',
    gradient: 'inherit',
  };

  if (!winnerTeamName) return initialState;

  const greenResult = {
    normal: 'rgba(99, 212, 113, 0.2)',
    gradient: 'linear-gradient(315deg, rgba(99, 212, 113, 0.3) 0%, rgba(35, 51, 41, 0.3) 74%)',
  };

  const redResult = {
    gradient:
      'linear-gradient(315deg, rgba(224, 69, 95, 0.3) 0%, rgba(68, 0, 11, 0.3) 74%)',
    normal: 'rgba(224, 69, 95, 0.2)',
  };

  return teamName === winnerTeamName ? greenResult : redResult;
};
