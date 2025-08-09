const mongoose = require('mongoose');

// models
const Scrim = require('../models/scrim.model');
const User = require('../models/user.model');
const Conversation = require('../models/conversation.model');

// services
const scrimScheduler = require('../services/scrimScheduler.services');

// utils
const generatePassword = require('../utils/generatePassword');
const {
  checkIfScrimIsToday,
  swapPlayer,
  getAvailableRoles,
  compareArrays,
  isValidRole,
  populateTeam,
  populateUser,
  getLobbyName,
  getLobbyHost,
  populateOneScrim,
  onSpotTaken,
  checkUnauthorized,
} = require('../utils/scrimUtils');
const capitalizeWord = require('../utils/capitalizeWord');
const KEYS = require('../config/keys');
const escape = require('escape-html');
const createS3 = require('../utils/createS3');
const uploadToBucket = require('../utils/uploadToBucket');

// for post-game lobby image upload
let s3Bucket = createS3();

/**
 * Build MongoDB query from request parameters
 */
const buildScrimQuery = (req) => {
  const query = {};

  // Date filtering
  if (req.query.date) {
    // Parse the date string and set to start/end of day in UTC
    const dateStr = req.query.date; // Expected format: YYYY-MM-DD
    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    query.gameStartTime = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  // Date range filtering
  if (req.query.startDate && req.query.endDate) {
    query.gameStartTime = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  // Region filtering
  if (req.query.region) {
    query.region = req.query.region;
  }

  // Privacy filtering (default to public scrims only)
  if (req.query.includePrivate !== 'true') {
    query.isPrivate = { $ne: true };
  }

  // Status filtering (current, upcoming, previous)
  const now = new Date();
  if (req.query.status) {
    switch (req.query.status) {
      case 'upcoming':
        query.gameStartTime = { $gt: now };
        query.teamWon = null;
        break;
      case 'current':
        query.gameStartTime = { $lte: now };
        query.teamWon = null;
        break;
      case 'previous':
        query.gameStartTime = { $lte: now };
        query.teamWon = { $ne: null };
        break;
    }
  }

  // Team won filtering
  if (req.query.teamWon) {
    query.teamWon = req.query.teamWon;
  }

  // Creator filtering
  if (req.query.createdBy) {
    query.createdBy = req.query.createdBy;
  }

  // Lobby host filtering
  if (req.query.lobbyHost) {
    query.lobbyHost = req.query.lobbyHost;
  }

  // Tournament status filtering
  if (req.query.hasTournament === 'true') {
    query['riotTournament.setupCompleted'] = true;
  }

  // Full teams only
  if (req.query.fullTeamsOnly === 'true') {
    query.$and = [
      { $expr: { $eq: [{ $size: '$teamOne' }, 5] } },
      { $expr: { $eq: [{ $size: '$teamTwo' }, 5] } },
    ];
  }

  // Status filtering (pending, active, completed, cancelled, abandoned)
  if (req.query.scrimStatus) {
    query.status = req.query.scrimStatus;
  }

  // By default, exclude only cancelled scrims (but show abandoned ones for historical data)
  if (!req.query.scrimStatus && req.query.includeInactive !== 'true') {
    query.status = { $nin: ['cancelled'] };
  }

  return query;
};

/**
 * Build sort options from request parameters
 */
const buildSortOptions = (req) => {
  const sortBy = req.query.sortBy || 'gameStartTime';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  // Secondary sort by creation date for stable ordering
  if (sortBy !== 'createdAt') {
    sortOptions.createdAt = -1;
  }

  return sortOptions;
};

// @route   GET /api/scrims
// @desc    Get scrims with advanced filtering and pagination
// @access  Public
const getAllScrims = async (req, res) => {
  try {
    // Build query from request parameters
    const query = buildScrimQuery(req);

    // Build sort options
    const sortOptions = buildSortOptions(req);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [scrims, totalCount] = await Promise.all([
      Scrim.find(query)
        .select('-editHistory')
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'))
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Scrim.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // For backward compatibility, if no specific query params, return simple array
    if (
      !req.query.page &&
      !req.query.status &&
      !req.query.date &&
      !req.query.sortBy
    ) {
      return res.status(200).json(scrims);
    }

    return res.status(200).json({
      success: true,
      data: scrims,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching scrims:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
// @route   GET /api/scrims/today
// @desc    Get today's scrims with proper date filtering
// @access  Public
const getTodaysScrims = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = {
      gameStartTime: {
        $gte: today,
        $lt: tomorrow,
      },
    };

    // Add region filter if provided
    if (req.query.region) {
      query.region = req.query.region;
    }

    // Add privacy filter
    if (req.query.includePrivate !== 'true') {
      query.isPrivate = { $ne: true };
    }

    const scrims = await Scrim.find(query)
      .select('-editHistory')
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .sort({ gameStartTime: 1 })
      .lean()
      .exec();

    return res.status(200).json(scrims);
  } catch (error) {
    console.error("Error fetching today's scrims:", error);
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/scrims/:id
// @desc    Get a specific scrim.
// @access  Public
const getScrimById = async (req, res) => {
  try {
    const { id } = req.params;
    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid scrim ID' });
    }

    let scrim = await Scrim.findOne({ _id: { $eq: id } })
      .select('-editHistory')
      .populate('casters', populateUser)
      .populate('createdBy', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'));

    if (!scrim) {
      return res.status(404).json({ message: 'Scrim not found!' });
    }

    return res.json(scrim);
  } catch (error) {
    console.error('Error finding scrim by id:', error);
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST /api/scrims
// @desc    create a new scrim / game
// @access  Private (only people with the admin key can see this page in the app and create one)
const createScrim = async (req, res) => {
  try {
    // Safely get the user ID
    const createdById = req.body.createdBy?._id || req.body.createdBy;

    if (!createdById) {
      return res.status(400).json({ error: 'Creator user ID is required' });
    }

    let createdByUser = await User.findOne({
      _id: { $eq: createdById },
    });

    if (!createdByUser) {
      return res.status(404).json({ error: 'Creator user not found' });
    }

    const requestBody = {
      ...req.body,
      lobbyName:
        req.body.lobbyName ||
        getLobbyName(
          req.body.title || `${createdByUser.name}'s Scrim`,
          req.body.region || 'NA'
        ),
      lobbyPassword: generatePassword(),
      createdBy: createdByUser,
    };

    const scrim = new Scrim({
      ...requestBody,
      status: 'pending', // Initialize with pending status
      statusUpdatedAt: new Date(),
    });

    // add scrim to new conversation
    const scrimConversation = new Conversation({
      members: [],
      _scrim: scrim._id,
    });

    // add that new conversation as _conversation inside scrim
    scrim._conversation = scrimConversation._id;

    await scrim.save(); // save scrim

    const savedConversation = await scrimConversation.save(); // save conv

    console.log('Scrim created: ', scrim);
    console.log('conversation created for scirm: ', savedConversation);

    // Schedule Riot tournament initialization for when countdown reaches 0
    const io = req.app.get('io');
    scrimScheduler.scheduleRiotTournamentInit(scrim, io);

    return res.status(201).json(scrim);
  } catch (error) {
    console.log('error creating scrim:', error);
    return res.status(500).json({ error: error.message });
  }
};

// @route   PUT /api/scrims/:id
// @desc    update an existing scrim (is ScrimEdit in the react app)
// @access  Private (only people with the admin key can update a scrim)
const updateScrim = async (req, res) => {
  const { id } = req.params;

  let isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid) {
    return res.status(500).json({ error: 'invalid id' });
  }

  const oneScrim = await Scrim.findById(id).select([
    '-teamOne',
    '-teamTwo',
    '-casters',
    '-lobbyHost',
  ]);

  if (!oneScrim) {
    return res.status(500).json({ error: 'scrim not found' });
  }

  let editHistory;

  if (oneScrim._doc.editHistory?.length) {
    editHistory = [
      {
        ...oneScrim._doc.editHistory,
        previousTitle: oneScrim._doc.title,
        payload: JSON.stringify(req.body),
        _user: req.user,
      },
    ];
  } else {
    editHistory = [
      {
        payload: JSON.stringify(req.body),
        _user: req.user,
        previousTitle: oneScrim._doc.title,
      },
    ];
  }

  const payload = {
    ...req.body,
    editHistory,
  };

  try {
    const scrim = await Scrim.findByIdAndUpdate(id, payload, { new: true })
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .exec();

    if (!scrim) {
      return res.status(404).json({ error: 'Scrim not found' });
    }

    // If game start time was updated, reschedule the Riot tournament initialization
    if (req.body.gameStartTime && !scrim.riotTournament?.setupCompleted) {
      const io = req.app.get('io');
      scrimScheduler.rescheduleRiotTournament(scrim, io);
    }

    return res.status(200).json(scrim);
  } catch (error) {
    console.error('Error updating scrim:', error);
    return res.status(500).json({ error: error.message });
  }
};

// @route   DELETE /api/scrims/:id
// @desc    delete an existing scrim
// @access  Private (only people with the admin key can delete a scrim)
const deleteScrim = async (req, res) => {
  try {
    const { id } = req.params;

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    // First update status to cancelled before deleting
    await Scrim.findByIdAndUpdate(id, {
      status: 'cancelled',
      statusUpdatedAt: new Date(),
    });

    const deleted = await Scrim.findByIdAndDelete(id);

    if (deleted) {
      // Cancel any scheduled tournament initialization
      scrimScheduler.cancelScheduledTournament(id);

      return res.status(200).send(`Scrim with id: ${escape(id)} deleted`);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   PATCH /api/scrims/:scrimId/insert-player/:userId
// @desc    This is how a player joins a team in the scrim (is used in ScrimTeamList.jsx)
// @access  Private
const insertPlayerInScrim = async (req, res) => {
  try {
    // when player joins
    const session = await Scrim.startSession();

    // beginning of session
    await session.withTransaction(async () => {
      const { scrimId, userId } = req.params;
      const { playerData } = req.body;

      const currentUser = req.user; // from auth middleware

      let isValidUser = mongoose.Types.ObjectId.isValid(userId);
      let isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);

      if (!isValidUser) {
        return res.status(500).json('invalid user id.');
      }

      if (!isValidScrim) {
        return res.status(500).json('invalid scrim id.');
      }

      const isUnauthorized = checkUnauthorized(currentUser, userId);

      if (isUnauthorized) {
        // if user isn't admin or isn't himself, that means he is not authorized to do this.
        return res.status(401).send({ error: 'Unauthorized' });
      }

      if (!playerData) {
        return res.status(500).json({
          error:
            'playerData object not provided, looks like this: playerData: { team: {name: String}, role: String }',
        });
      }

      // if req.body has no team name
      if (!playerData.team?.name) {
        return res.status(500).json({
          error:
            'team object not provided! looks like this: playerData: { {team: {name: String}} }',
        });
      }

      if (!playerData?.role) {
        return res.status(500).json({
          error:
            'role string not provided! looks like this: playerData {role: String}',
        });
      }

      let roleIsValid = isValidRole(playerData.role);

      if (!roleIsValid) {
        return res.status(500).json({
          error: 'role not valid: has to match: Top, Jungle, Mid, ADC, Support',
        });
      }

      const scrim = await Scrim.findById(scrimId);
      const user = await User.findById(userId);

      if (!scrim) {
        return res.status(500).send('Scrim not found');
      }

      if (!user) {
        return res.status(500).send('User not found');
      }

      const playerExists = [...scrim._doc.teamOne, ...scrim._doc.teamTwo].find(
        (player) => String(player._user) === String(user._id)
      );

      const casterExists = scrim._doc.casters.find(
        (caster) => String(caster._id) === String(user._id)
      );

      // when somebody makes an api call for /insert-player but actually meant to move the player.
      if (playerExists) {
        return res.status(500).json({
          error:
            'Player already exists in game. Did you mean to move the player? use the /move-player endpoint instead.',
        });
      }

      if (casterExists) {
        return res.status(500).json({
          error:
            'User already is a caster. you cannot be a caster and a player in the same game!.',
        });
      }

      const teamJoiningName = playerData.team.name;

      const playerInTransaction = {
        // if role is adc make it all uppercase, else just capitalize first letter of role.
        role: /adc/gi.test(playerData.role)
          ? playerData.role.toUpperCase()
          : capitalizeWord(playerData.role),
        team: playerData.team,

        _user: {
          ...user._doc,
        },
      };

      const teamJoiningArr =
        teamJoiningName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

      const spotsAvailable = getAvailableRoles(teamJoiningArr);

      let reqBody = {
        [teamJoiningName]: [...teamJoiningArr, playerInTransaction],
      };

      const spotTaken = scrim._doc[teamJoiningName].find(
        (player) => player.role === playerInTransaction.role
      );

      if (spotTaken) {
        onSpotTaken(scrim._doc, res, spotsAvailable, teamJoiningName);
        return;
      }

      const updatedScrim = await Scrim.findByIdAndUpdate(scrimId, reqBody, {
        new: true,
      })
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'));

      if (!updatedScrim) {
        return res.status(500).send('Scrim not found');
      }

      // check for lobby host / captain everytime player joins
      const lobbyHost = await getLobbyHost(updatedScrim);
      updatedScrim.lobbyHost = lobbyHost;

      await updatedScrim.save();

      // Check if we should generate tournament code
      // Conditions: teams are full, game time has passed, no tournament code exists yet
      const now = new Date();
      const gameStartTime = new Date(updatedScrim.gameStartTime);
      const gameHasStarted = now >= gameStartTime;
      const teamsFull =
        updatedScrim.teamOne.length === 5 && updatedScrim.teamTwo.length === 5;
      const noTournamentCode = !updatedScrim.riotTournament?.tournamentCode;

      if (gameHasStarted && teamsFull && noTournamentCode) {
        // Teams just became full after countdown reached 0 - generate tournament code
        console.log(
          `Teams filled after countdown for scrim ${scrimId}, initializing tournament`
        );
        const io = req.app.get('io');

        // Use the existing function to initialize tournament
        await scrimScheduler.initializeRiotTournamentForScrim(scrimId, io);

        // Fetch the updated scrim with tournament data
        const finalScrim = await Scrim.findById(scrimId)
          .populate('createdBy', populateUser)
          .populate('casters', populateUser)
          .populate('lobbyHost', populateUser)
          .populate(populateTeam('teamOne'))
          .populate(populateTeam('teamTwo'));

        return res.status(200).json(finalScrim);
      }

      return res.status(200).json(updatedScrim);
    });

    // end of session
    session.endSession();
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || 'Error inserting player' });
  }
};

// @route   PATCH /api/scrims/:scrimId/remove-player/:userId
// @desc    This is how a player leaves a team in the scrim or an admin kicks a player (is used in ScrimTeamList.jsx)
// @access  Private
const removePlayerFromScrim = async (req, res) => {
  try {
    // when player leaves or gets kicked
    const { userId, scrimId } = req.params;

    const currentUser = req.user;

    let isValidUser = mongoose.Types.ObjectId.isValid(userId);
    let isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);

    if (!isValidUser) {
      return res.status(500).json('invalid user id.');
    }

    if (!isValidScrim) {
      return res.status(500).json('invalid scrim id.');
    }

    const isUnauthorized = checkUnauthorized(currentUser, userId); // here it's important to use, because admins can kick players

    if (isUnauthorized) {
      // if user isn't admin or isn't himself, that means he is not authorized to do this.
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const scrim = await Scrim.findById(scrimId);
    const _user = await User.findById(userId); // user leaving or being kicked

    if (!scrim) {
      return res.status(500).send('Scrim not found');
    }

    if (!_user) {
      return res.status(500).json('user not found!');
    }

    const playerInScrim = [...scrim._doc.teamOne, ...scrim._doc.teamTwo].find(
      (player) => String(player._user) === String(userId)
    );

    if (!playerInScrim) {
      return res.status(400).json({ error: 'Player not found in scrim' });
    }

    const teamLeavingName = playerInScrim.team.name;

    const teamLeavingArr =
      teamLeavingName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

    let isLobbyHost = String(scrim._doc.lobbyHost?._id) === String(_user?._id);

    const scrimData = {
      // filter array to remove player leaving
      [teamLeavingName]: teamLeavingArr.filter(
        (player) =>
          //  we didn't populate here so player._user is actually just user._id
          String(player._user) !== String(_user?._id)
      ),
      lobbyHost: isLobbyHost ? null : scrim?._doc?.lobbyHost ?? null, // if player leaving is hosting, reset the host to null
    };

    const updatedScrim = await Scrim.findByIdAndUpdate(scrimId, scrimData, {
      new: true,
    })
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'));

    if (!updatedScrim) {
      return res.status(500).send('Scrim not found');
    }

    return res.status(200).json(updatedScrim);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || 'Error removing player' });
  }
};

// @route   PATCH /api/scrims/:scrimId/move-player/:userId
// @desc    This is how a player moves positions/roles and also may or may not change teams (is used in ScrimTeamList.jsx)
// very similiar to insertPlayerInScrim, I used to have both of these in 1 function that would just know what to do, and I think maybe it was better, not sure.
// @access  Private
const movePlayerInScrim = async (req, res) => {
  try {
    // when player moves positions and/or teams
    const session = await Scrim.startSession();

    // beginning of session
    await session.withTransaction(async () => {
      const { userId, scrimId } = req.params;
      const { playerData } = req.body;

      const currentUser = req.user;

      // check for invalid/malicious ids
      let isValidUser = mongoose.Types.ObjectId.isValid(userId);
      let isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);

      if (!isValidUser) {
        return res.status(500).json({ error: 'invalid user id.' });
      }

      if (!isValidScrim) {
        return res.status(500).json({ error: 'invalid scrim id.' });
      }

      const isUnauthorized = checkUnauthorized(currentUser, userId);

      if (isUnauthorized) {
        // if user isn't admin or isn't himself, that means he is not authorized to do this.
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const scrim = await Scrim.findById(scrimId);
      const user = await User.findById(userId);

      if (!scrim) {
        return res.status(500).send({ error: 'Scrim not found' });
      }

      if (!user) {
        return res.status(500).send({ error: 'User not found' });
      }

      const teamJoiningName = playerData.team.name;

      const teamJoiningArr =
        teamJoiningName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

      const playerFound = [...scrim._doc.teamOne, ...scrim._doc.teamTwo].find(
        (player) => String(player._user) === String(user._id)
      );

      if (!playerData?.role) {
        return res.status(500).json({
          error:
            'role string not provided! looks like this: playerData {role: String}',
        });
      }

      let roleIsValid = isValidRole(playerData.role);

      if (!roleIsValid) {
        return res.status(500).json({
          error: 'role not valid: has to match: Top, Jungle, Mid, ADC, Support',
        });
      }

      // when somebody makes an api call for /insert-player but actually meant to move the player.
      if (!playerFound) {
        return res.status(500).json({
          error:
            'Player does not exist in game. Did you mean to join or insert the player? use the /insert-player endpoint instead.',
        });
      }

      // the player state before the transaction
      const previousPlayerState = [
        ...scrim._doc.teamOne,
        ...scrim._doc.teamTwo,
      ].find((player) => String(player._user) === String(user._id));

      let previousTeamArr =
        previousPlayerState.team.name === 'teamOne'
          ? scrim._doc.teamOne
          : scrim._doc.teamTwo;

      const isChangingTeams =
        compareArrays(previousTeamArr, teamJoiningArr) === false;

      const playerInTransaction = {
        // if it's adc, make it all uppercase, else capitalize it.
        // this is just if someone is using postman and is misspelling the casing.
        role: /adc/gi.test(playerData.role)
          ? playerData.role.toUpperCase()
          : capitalizeWord(playerData.role),
        team: playerData.team,

        _user: {
          ...user._doc,
        },
      };

      const spotTaken = scrim._doc[teamJoiningName].find(
        (player) => player.role === playerInTransaction.role
      );

      const spotsAvailable = getAvailableRoles(teamJoiningArr);

      let newBody = {};

      if (isChangingTeams) {
        // if player is changing teams

        const teamChangingToName = playerData.team.name,
          teamLeavingName = previousPlayerState.team.name;

        const teamLeavingArray =
          teamLeavingName === 'teamOne'
            ? scrim._doc.teamOne
            : scrim._doc.teamTwo;

        const teamChangingToArray =
          teamChangingToName === 'teamOne'
            ? scrim._doc.teamOne
            : scrim._doc.teamTwo;

        let [teamLeft, teamJoined] = swapPlayer(
          teamLeavingArray,
          teamChangingToArray,
          playerInTransaction
        );

        newBody = {
          // team left array state after swap player function
          [teamLeavingName]: teamLeft,
          [teamJoiningName]: [
            ...teamJoined.map((player) =>
              // ._user is just an id here because of no populate
              player._user === playerInTransaction._user._id
                ? playerInTransaction
                : player
            ),
          ],
        };
      } else {
        // if moving but not changing teams

        // remove the player from the team
        let restOfTeam = [...teamJoiningArr].filter(
          (player) => String(player._user) !== String(user._id)
        );

        // re-insert him in the same team in his new role.
        newBody = {
          [teamJoiningName]: [...restOfTeam, playerInTransaction],
        };
      }

      if (spotTaken) {
        onSpotTaken(scrim._doc, res, spotsAvailable, teamJoiningName);
        return;
      }

      const updatedScrim = await Scrim.findByIdAndUpdate(scrimId, newBody, {
        new: true,
      })
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'))
        .exec();

      if (!updatedScrim) {
        return res.status(404).json({ error: 'Scrim not found' });
      }

      // check to select lobby host / captain for the scrim everytime someone moves
      const lobbyHost = await getLobbyHost(updatedScrim);
      updatedScrim.lobbyHost = lobbyHost;

      await updatedScrim.save();
      return res.status(200).json(updatedScrim);
    });

    // end of session
    session.endSession();
  } catch (err) {
    console.log('Error moving player in scrim:', err);
    return res
      .status(500)
      .json({ error: err.message || 'Error moving player' });
  }
};

const swapPlayersInScrim = async (req, res) => {
  try {
    const session = await Scrim.startSession();

    // beginning of session
    await session.withTransaction(async () => {
      const { playerOne, playerTwo } = req.body;

      const scrimId = req.params.scrimId;
      let scrim = await Scrim.findOne({ _id: scrimId });

      if (!scrim) {
        return res.status(404).json({ error: 'Scrim not found' });
      }

      const teams = [...scrim.teamOne, ...scrim.teamTwo];

      let updatedTeamOne = [];
      let updatedTeamTwo = [];

      if (!!playerOne._user && !!playerTwo._user) {
        // if swapping between two players
        for (const player of scrim.teamOne) {
          if (String(player._user) === String(playerOne._user)) {
            const swappedPlayer = {
              ...player._doc,
              _user: playerTwo._user,
            };

            updatedTeamOne.push(swappedPlayer);
          } else if (String(player._user) === String(playerTwo._user)) {
            const swappedPlayer = {
              ...player._doc,
              _user: playerOne._user,
            };

            updatedTeamOne.push(swappedPlayer);
          } else {
            updatedTeamOne.push(player);
          }
        }

        for (const player of scrim.teamTwo) {
          if (String(player._user) === String(playerOne._user)) {
            const swappedPlayer = {
              ...player._doc,
              _user: playerTwo._user,
            };

            updatedTeamTwo.push(swappedPlayer);
          } else if (String(player._user) === String(playerTwo._user)) {
            const swappedPlayer = {
              ...player._doc,
              _user: playerOne._user,
            };

            updatedTeamTwo.push(swappedPlayer);
          } else {
            updatedTeamTwo.push(player);
          }
        }
      } else {
        // if only moving 1 player to empty spot (not swapping between two players)
        return await movePlayerInScrim(
          {
            ...req,
            params: {
              ...req.params,
              userId: playerOne._user,
            },
            body: {
              playerData: {
                role: playerTwo.role,
                team: { name: playerTwo.team },
              },
            },
          },
          res
        );
      }

      scrim.teamOne = updatedTeamOne;
      scrim.teamTwo = updatedTeamTwo;

      let savedScrim = await scrim.save();
      const populatedScrim = await populateOneScrim(scrimId);

      return res.status(200).json(populatedScrim);
    });

    session.endSession();
  } catch (err) {
    console.log('Error swapping players:', err);
    return res
      .status(500)
      .json({ error: err.message || 'Error swapping players' });
  }
};

// @route   PATCH /api/scrims/:scrimId/insert-caster/:casterId
// @desc    This is how a user can become a caster for a scrim (used in ScrimSectionHeader)
// @access  Private
const insertCasterInScrim = async (req, res) => {
  try {
    const session = await Scrim.startSession();

    await session.withTransaction(async () => {
      const { scrimId, casterId } = req.params;
      const currentUser = req.user;

      const isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);
      const isValidCaster = mongoose.Types.ObjectId.isValid(casterId);

      if (!isValidCaster) {
        return res.status(500).json('invalid user id.');
      }

      if (!isValidScrim) {
        return res.status(500).json('invalid scrim id.');
      }

      const isUnauthorized = checkUnauthorized(currentUser, casterId);

      if (isUnauthorized) {
        // if user isn't admin or isn't himself, that means he is not authorized to do this.
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const scrim = await Scrim.findById(scrimId);

      if (!scrim) {
        return res.status(404).json({ error: 'Scrim not found' });
      }

      if (!scrim.isWithCasters) {
        return res.status(500).json({
          error: 'Cannot join as caster, (scrim has casters disabled)',
        });
      }

      if (scrim.casters.length >= scrim.maxCastersAllowedCount) {
        return res
          .status(500)
          .json({ error: 'Cannot join as caster, (caster spots full)' });
      }

      const casterJoining = await User.findById(casterId);

      if (!casterJoining) {
        return res.status(500).json('user not found');
      }

      const casterFound = scrim._doc.casters.find(
        (caster) => String(caster._id) === String(casterId)
      );

      if (casterFound) {
        return res
          .status(500)
          .json(
            `caster ${casterJoining.name} is already a caster for this game!.`
          );
      }

      const teams = [...scrim._doc.teamOne, ...scrim._doc.teamTwo];

      const playerFound = teams.find(
        (player) => String(player?._user) === String(casterJoining._id)
      );

      if (playerFound) {
        return res
          .status(500)
          .json(
            `player ${casterJoining.name} (team: ${playerFound.team.name}, role: ${playerFound.role}) cannot be a player and a caster at the same time!.`
          );
      }

      let bodyData = {
        casters: [...scrim._doc.casters, casterJoining],
      };

      if (scrim._doc.casters.length < 2) {
        const updatedScrim = await Scrim.findByIdAndUpdate(scrimId, bodyData, {
          new: true,
        })
          .populate('createdBy', populateUser)
          .populate('casters', populateUser)
          .populate('lobbyHost', populateUser)
          .populate(populateTeam('teamOne'))
          .populate(populateTeam('teamTwo'));

        if (!updatedScrim) {
          return res.status(500).send('Scrim not found');
        }

        return res.status(200).json(updatedScrim);
      } else {
        return res.status(500).json({
          error: 'Caster spots full!',
          scrim: await populateOneScrim(scrimId),
        });
      }
    });
    session.endSession();
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || 'Error inserting caster' });
  }
};

// @route   PATCH /api/scrims/:scrimId/remove-caster/:casterId
// @desc    This is how a user can leave the caster list if he was one for a scrim (used in ScrimSectionHeader)
// @access  Private
const removeCasterFromScrim = async (req, res) => {
  try {
    const session = await Scrim.startSession();

    await session.withTransaction(async () => {
      const { scrimId, casterId } = req.params; // scrim id
      const currentUser = req.user;

      const isValid = mongoose.Types.ObjectId.isValid(casterId);

      if (!isValid) {
        return res.status(500).json('invalid response.');
      }

      const isUnauthorized = checkUnauthorized(currentUser, casterId);

      if (isUnauthorized) {
        // if user isn't admin or isn't himself, that means he is not authorized to do this.
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const casterLeaving = await User.findOne({ _id: casterId });

      if (!casterLeaving) {
        return res.status(500).json(`caster not found in scrim ${scrimId}`);
      }

      const { casters } = scrim;

      // without populate the only data is the id's.
      const bodyData = {
        casters: [...casters].filter(
          (casterId) => String(casterId) !== String(casterLeaving._id)
        ),
      };

      const scrim = await Scrim.findByIdAndUpdate(scrimId, bodyData, {
        new: true,
      })
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'))
        .exec();

      if (!scrim) {
        return res.status(404).json({ error: 'Scrim not found' });
      }

      return res.status(200).json(scrim);
    });
    session.endSession();
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || 'Error removing caster' });
  }
};

// @route   PATCH /api/scrims/:id/add-image
// @desc    This is how a lobbyHost or an admin can upload an image to the scrim to verify the winner (more uploading func is in UploadPostGameImage.jsx)
// @access  Private
const addImageToScrim = async (req, res) => {
  try {
    // client uplaods to s3 bucket, back-end saves endpoints
    const { id } = req.params;
    const { timestampNow = Date.now(), uploadedBy, base64 } = req.body;

    const scrim1 = await Scrim.findById(id);

    if (!scrim1?._id) {
      return res.status(404).json({ error: 'Scrim not found' });
    }

    const isLobbyHost =
      String(scrim1._doc.lobbyHost?._id) === String(req.user?._id);

    if (!base64) {
      return res.status(500).json({
        error: 'image not provided',
      });
    }

    if (!isLobbyHost) {
      if (req.user.adminKey !== KEYS.ADMIN_KEY) {
        return res.status(401).json({
          error:
            'You cannot upload an image (you are not a lobby host or an admin)',
        });
      }
    }

    const { bucket, key, location } = await uploadToBucket({
      fileName: `${scrim1._id}-${timestampNow}`,
      dirName: `postGameLobbyImages/${scrim1._id}`,
      base64,
    });

    let dataSending = {
      postGameImage: {
        bucket,
        key,
        location,
        uploadedBy,
      },
    };

    const scrim = await Scrim.findByIdAndUpdate(id, dataSending, { new: true })
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .exec();

    if (!scrim) {
      return res.status(404).json({ error: 'Scrim not found' });
    }

    return res.status(200).json(scrim);
  } catch (err) {
    console.log('error uploading image', err);
    return res
      .status(500)
      .json({ error: err.message || 'Error uploading image' });
  }
};

// @route   PATCH /api/scrims/:id/remove-image
// @desc    This is how only an admin can remove an image from a scrim
// @access  Private
const removeImageFromScrim = async (req, res) => {
  const { id } = req.params;

  try {
    const scrim1 = await Scrim.findById(id);

    if (!scrim1?._id) {
      return res.status(404).json({ error: 'Scrim not found' });
    }

    if (!scrim1.postGameImage) {
      return res.status(400).json({ error: 'Image does not exist!' });
    }

    const params = {
      Bucket: KEYS.S3_BUCKET_NAME,
      Key: scrim1.postGameImage.key,
    };

    const dataSending = {
      postGameImage: null,
    };

    // delete image in S3
    await s3Bucket.deleteObject(params).promise();

    // delete it from the scrim object in the mongoose database
    const scrim = await Scrim.findByIdAndUpdate(id, dataSending, { new: true })
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .exec();

    if (!scrim) {
      return res.status(404).json({ error: 'Scrim not found' });
    }

    return res.status(200).json(scrim);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || 'Error removing image' });
  }
};

// @route   PATCH /api/scrims/:id/set-winner
// @desc    select a winner for the scrim, only an admin or a lobby host can select a winner
// @access  Public
const setScrimWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const winnerTeamName = escape(req.body.winnerTeamName) ?? ''; // we don't need escape anymore because we use sanitize in server.js

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    let scrim = await Scrim.findOne({ _id: { $eq: id } });

    if (!scrim) return res.status(404).json({ message: 'Scrim not found!' });

    const isLobbyHost =
      String(scrim._doc.lobbyHost?._id) === String(req.user?._id);

    if (!isLobbyHost) {
      if (req.user.adminKey !== KEYS.ADMIN_KEY) {
        return res.status(401).json({
          error:
            'You cannot upload an image (you are not a lobby host or an admin)',
        });
      }
    }

    // 1: blueside, 2: redside
    if (!['teamOne', 'teamTwo'].includes(winnerTeamName)) {
      return res.status(404).json({ message: 'Invalid team name' });
    }

    scrim.teamWon = winnerTeamName;
    scrim.status = 'completed';
    scrim.statusUpdatedAt = new Date();

    await scrim.save();

    let populatedScrim = await populateOneScrim(scrim._id);

    return res.status(200).send(populatedScrim);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || 'Error setting scrim winner' });
  }
};

// @route   PATCH /api/scrims/:id/cancel
// @desc    Cancel a scrim (sets status to cancelled)
// @access  Private (admin only)
const cancelScrim = async (req, res) => {
  try {
    const { id } = req.params;

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    const scrim = await Scrim.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        statusUpdatedAt: new Date(),
      },
      { new: true }
    );

    if (!scrim) {
      return res.status(404).json({ error: 'Scrim not found' });
    }

    // Cancel any scheduled tournament initialization
    scrimScheduler.cancelScheduledTournament(id);

    // Populate and return the updated scrim
    const populatedScrim = await populateOneScrim(scrim._id);

    return res.status(200).json(populatedScrim);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   PATCH /api/scrims/:scrimId/admin-assign-player
// @desc    Admin manually assigns a player to a specific position
// @access  Private (admin only)
const adminAssignPlayer = async (req, res) => {
  try {
    const { scrimId } = req.params;
    const { userId, teamName, role } = req.body;

    // Validate required fields
    if (!userId || !teamName || !role) {
      return res.status(400).json({
        error: 'userId, teamName, and role are required',
      });
    }

    // Check if scrim exists
    const scrim = await Scrim.findById(scrimId);
    if (!scrim) {
      return res.status(404).json({ error: 'Scrim not found' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate team name
    if (!['teamOne', 'teamTwo'].includes(teamName)) {
      return res
        .status(400)
        .json({ error: 'Invalid team name. Must be teamOne or teamTwo' });
    }

    // Validate role
    const validRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        });
    }

    // Check if player is already in the scrim
    const playerExists = [...scrim.teamOne, ...scrim.teamTwo].find(
      (player) => String(player._user) === String(user._id)
    );

    // Check if player is a caster
    const casterExists = scrim.casters.find(
      (caster) => String(caster._id) === String(user._id)
    );

    if (casterExists) {
      return res.status(400).json({
        error: 'User is already a caster for this game',
      });
    }

    // Check if position is already taken
    const spotTaken = scrim[teamName].find((player) => player.role === role);

    if (spotTaken) {
      return res.status(400).json({
        error: `${role} position in ${teamName} is already taken by ${
          spotTaken._user?.name || 'another player'
        }`,
      });
    }

    const playerData = {
      role,
      team: { name: teamName },
      _user: user._id,
    };

    let updateQuery = {};

    if (playerExists) {
      // Remove player from current position first
      const currentTeam = playerExists.team.name;
      const currentTeamArray = scrim[currentTeam].filter(
        (player) => String(player._user) !== String(user._id)
      );

      // Add to new position
      const newTeamArray = [...scrim[teamName], playerData];

      updateQuery = {
        [currentTeam]: currentTeamArray,
        [teamName]: newTeamArray,
      };
    } else {
      // Just add player to the team
      updateQuery = {
        [teamName]: [...scrim[teamName], playerData],
      };
    }

    const updatedScrim = await Scrim.findByIdAndUpdate(scrimId, updateQuery, {
      new: true,
    })
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'));

    if (!updatedScrim) {
      return res.status(404).json({ error: 'Scrim not found' });
    }

    // Check if we should generate tournament code after assigning
    // Conditions: teams are now full, game time has passed, no tournament code exists yet
    const now = new Date();
    const gameStartTime = new Date(updatedScrim.gameStartTime);
    const gameHasStarted = now >= gameStartTime;
    const teamsFull =
      updatedScrim.teamOne.length === 5 && updatedScrim.teamTwo.length === 5;
    const noTournamentCode = !updatedScrim.riotTournament?.tournamentCode;

    if (gameHasStarted && teamsFull && noTournamentCode) {
      // Teams just became full after countdown reached 0 - generate tournament code
      console.log(
        `Teams filled after countdown for scrim ${scrimId}, initializing tournament`
      );
      const io = req.app.get('io');

      // Use the existing function to initialize tournament
      await scrimScheduler.initializeRiotTournamentForScrim(scrimId, io);

      // Fetch the updated scrim with tournament data
      const finalScrim = await Scrim.findById(scrimId)
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'));

      return res.status(200).json(finalScrim);
    }

    return res.status(200).json(updatedScrim);
  } catch (error) {
    console.error('Error in admin assign player:', error);
    return res.status(500).json({ error: error.message });
  }
};

// @route   PATCH /api/scrims/:scrimId/admin-fill-random
// @desc    Admin fills all empty positions with random available users
// @access  Private (admin only)
const adminFillRandomPositions = async (req, res) => {
  try {
    const { scrimId } = req.params;
    const { region } = req.body; // Optional region filter

    const scrim = await Scrim.findById(scrimId);
    if (!scrim) {
      return res.status(404).json({ error: 'Scrim not found' });
    }

    // Get all empty positions
    const allRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
    const emptyPositions = [];

    // Check teamOne
    const teamOneRoles = scrim.teamOne.map((player) => player.role);
    const teamOneEmpty = allRoles.filter(
      (role) => !teamOneRoles.includes(role)
    );
    teamOneEmpty.forEach((role) => {
      emptyPositions.push({ team: 'teamOne', role });
    });

    // Check teamTwo
    const teamTwoRoles = scrim.teamTwo.map((player) => player.role);
    const teamTwoEmpty = allRoles.filter(
      (role) => !teamTwoRoles.includes(role)
    );
    teamTwoEmpty.forEach((role) => {
      emptyPositions.push({ team: 'teamTwo', role });
    });

    if (emptyPositions.length === 0) {
      return res.status(400).json({ error: 'No empty positions to fill' });
    }

    // Get users already in this scrim
    const currentPlayers = [...scrim.teamOne, ...scrim.teamTwo].map((player) =>
      String(player._user)
    );
    const currentCasters = scrim.casters.map((caster) => String(caster._id));
    const excludeUsers = [...currentPlayers, ...currentCasters];

    // Build query to find available users
    const userQuery = {
      _id: { $nin: excludeUsers },
    };

    // Add region filter if provided
    if (region) {
      userQuery.region = region.toUpperCase();
    } else {
      // Default to scrim's region
      userQuery.region = scrim.region;
    }

    // Get random users (more than needed in case some are filtered out)
    const availableUsers = await User.find(userQuery)
      .select(['_id', 'name', 'discord', 'rank', 'region'])
      .limit(emptyPositions.length * 3) // Get extra users in case we need them
      .lean();

    if (availableUsers.length < emptyPositions.length) {
      return res.status(400).json({
        error: `Not enough available users. Found ${availableUsers.length}, need ${emptyPositions.length}`,
      });
    }

    // Shuffle available users
    const shuffledUsers = availableUsers.sort(() => 0.5 - Math.random());

    // Assign users to positions
    const updatedTeamOne = [...scrim.teamOne];
    const updatedTeamTwo = [...scrim.teamTwo];

    emptyPositions.forEach((position, index) => {
      const user = shuffledUsers[index];
      const playerData = {
        role: position.role,
        team: { name: position.team },
        _user: user._id,
      };

      if (position.team === 'teamOne') {
        updatedTeamOne.push(playerData);
      } else {
        updatedTeamTwo.push(playerData);
      }
    });

    const updatedScrim = await Scrim.findByIdAndUpdate(
      scrimId,
      {
        teamOne: updatedTeamOne,
        teamTwo: updatedTeamTwo,
      },
      { new: true }
    )
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'));

    if (!updatedScrim) {
      return res.status(404).json({ error: 'Scrim not found' });
    }

    // Check if we should generate tournament code after filling
    // Conditions: teams are now full, game time has passed, no tournament code exists yet
    const now = new Date();
    const gameStartTime = new Date(updatedScrim.gameStartTime);
    const gameHasStarted = now >= gameStartTime;
    const teamsFull =
      updatedScrim.teamOne.length === 5 && updatedScrim.teamTwo.length === 5;
    const noTournamentCode = !updatedScrim.riotTournament?.tournamentCode;

    if (gameHasStarted && teamsFull && noTournamentCode) {
      // Teams just became full after countdown reached 0 - generate tournament code
      console.log(
        `Teams filled after countdown for scrim ${scrimId}, initializing tournament`
      );
      const io = req.app.get('io');

      // Use the existing function to initialize tournament
      await scrimScheduler.initializeRiotTournamentForScrim(scrimId, io);

      // Fetch the updated scrim with tournament data
      const finalScrim = await Scrim.findById(scrimId)
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'));

      return res.status(200).json({
        scrim: finalScrim,
        filledPositions: emptyPositions.length,
        assignedUsers: shuffledUsers
          .slice(0, emptyPositions.length)
          .map((user) => ({
            name: user.name,
            region: user.region,
          })),
      });
    }

    return res.status(200).json({
      scrim: updatedScrim,
      filledPositions: emptyPositions.length,
      assignedUsers: shuffledUsers
        .slice(0, emptyPositions.length)
        .map((user) => ({
          name: user.name,
          region: user.region,
        })),
    });
  } catch (error) {
    console.error('Error in admin fill random positions:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllScrims,
  getTodaysScrims,
  getScrimById,
  createScrim,
  updateScrim,
  insertPlayerInScrim,
  deleteScrim,
  removePlayerFromScrim,
  removeCasterFromScrim,
  insertCasterInScrim,
  addImageToScrim,
  movePlayerInScrim,
  removeImageFromScrim,
  setScrimWinner,
  swapPlayersInScrim,
  cancelScrim,
  adminAssignPlayer,
  adminFillRandomPositions,
};
