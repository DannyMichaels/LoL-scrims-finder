const validateRank = async ({ rank, req, res }) => {
  const divisionsWithNumbers = [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Emerald',
    'Diamond',
  ];

  const allowedRanks = [
    'Unranked',
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Emerald',
    'Diamond',
    'Master',
    'Grandmaster',
    'Challenger',
  ];

  let rankDivision = rank.replace(/[0-9]/g, '').trim();

  let isDivisionWithNumber = divisionsWithNumbers.includes(rankDivision);

  const rankInvalid = !allowedRanks.includes(rankDivision);

  if (rankInvalid) {
    res.status(500).json({
      status: false,
      error: 'Invalid rank provided.',
    });

    return false;
  }

  if (isDivisionWithNumber) {
    const rankNumber = rank.replace(/[a-z]/gi, '').trim();

    // check that rank has digits
    if (!/\d/.test(rank)) {
      res.status(500).json({
        status: false,
        error: 'Rank number not provided',
      });

      return false;
    }

    // check that rankNumber is only 1 digit
    if (!/^\d{1,1}$/.test(rankNumber)) {
      res.status(500).json({
        status: false,
        error: 'Rank number invalid: should only contain one digit from 1-4.',
      });

      return false;
    }

    // check that rankNumber is a digit in range from one to four
    if (!/[1-4]/.test(rankNumber)) {
      res.status(500).json({
        status: false,
        error:
          'Rank number is invalid! (should only contain one digit from 1-4)',
      });

      return false;
    }
  } else if (!isDivisionWithNumber) {
    // if the rank division doesn't have a number (aka challenger, master, etc), check that it doesn't have digits
    if (/\d/.test(rank)) {
      res.status(500).json({
        status: false,
        error: 'The provided rank should not have a number',
      });

      return false;
    }
  }

  return true;
};

const checkSummonerNameValid = (summonerName) => {
  const format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  // dont allow special characters
  return format.test(summonerName);
};

const validateSummonerTagline = (tagline) => {
  // Tagline should be alphanumeric, typically 3-5 characters
  // Examples: "NA1", "EUW", "2737", "ABC1"
  const taglineFormat = /^[A-Za-z0-9]{2,5}$/;
  return taglineFormat.test(tagline);
};

const validateDiscordUsername = (discord) => {
  // New Discord username format: lowercase letters, numbers, underscore, period
  // Min 2 chars, max 32 chars
  // Can't start/end with period, no consecutive periods
  const discordFormat = /^(?!.*\.\.)(?!\.)[a-z0-9_.]{2,32}(?<!\.)$/;
  
  // Also allow old format for backwards compatibility (username#0000)
  const oldDiscordFormat = /^.+#\d{4}$/;
  
  return discordFormat.test(discord.toLowerCase()) || oldDiscordFormat.test(discord);
};

module.exports = {
  validateRank,
  checkSummonerNameValid,
  validateSummonerTagline,
  validateDiscordUsername,
};
