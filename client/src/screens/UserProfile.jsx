import { useState, useEffect, useMemo, memo } from 'react';
import useAuth from './../hooks/useAuth';
import { useParams, useHistory, Link } from 'react-router-dom';
import { useProfileStyles } from './../styles/UserProfile.styles';

// components
import Navbar from '../components/shared/Navbar/Navbar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Loading from '../components/shared/Loading';
import { InnerColumn } from '../components/shared/PageComponents';
import Tooltip from '../components/shared/Tooltip';
import Moment from 'react-moment';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';

// services
import {
  getOneUser,
  getUserCreatedScrims,
  getUserParticipatedScrims,
} from '../services/users';

// utils
import { showEarliestFirst, showLatestFirst } from './../utils/getSortedScrims';

// icons
import VerifiedAdminIcon from '@mui/icons-material/VerifiedUser';
import useToggle from './../hooks/useToggle';

export default function UserProfile() {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userCreatedScrims, setUserCreatedScrims] = useState([]);
  const [userParticipatedScrims, setUserParticipatedScrims] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { id } = useParams();
  const history = useHistory();

  const isCurrentUser = useMemo(
    () => userData?._id === currentUser?._id,
    [currentUser?._id, userData?._id]
  );

  const titleText = useMemo(() => {
    // if the user in the page is the current user, say "My Profile"
    if (isCurrentUser) return 'My Profile';
    return `${userData?.name}'s Profile`; // else say "Bob's  Profile" or whatever
  }, [isCurrentUser, userData?.name]);

  useEffect(() => {
    const fetchUserData = async () => {
      const fetchedUserData = await getOneUser(id);
      setUserData(fetchedUserData);

      // don't fetch userCreatedScrims if user isn't an admin and isn't himself
      if (isCurrentUserAdmin && isCurrentUser) {
        const userCreatedScrims = await getUserCreatedScrims(id);
        setUserCreatedScrims(userCreatedScrims);
      }

      const userScrims = await getUserParticipatedScrims(id);
      setUserParticipatedScrims(userScrims);

      setIsLoaded(true);
    };

    fetchUserData();
  }, [id, isCurrentUser, isCurrentUserAdmin]);

  if (!isLoaded) {
    return <Loading text="Loading..." />;
  }

  return (
    <>
      <Navbar showLess onClickBack={() => history.push('/')} />
      <InnerColumn>
        <Typography variant="h1">
          <Tooltip title={`visit ${userData?.name}'s op.gg`}>
            <a
              className="link"
              href={`https://${userData?.region}.op.gg/summoner/userName=${userData?.name}`}
              target="_blank"
              rel="noopener noreferrer">
              {titleText}
            </a>
          </Tooltip>
        </Typography>

        {/* User Details */}
        <AccountDetails
          user={userData}
          userParticipatedScrims={userParticipatedScrims}
        />

        {/* My Scrims (will only render if is current user) */}
        <MyCreatedScrims
          isCurrentUser={isCurrentUser}
          scrims={userCreatedScrims}
        />
      </InnerColumn>
    </>
  );
}

const AccountDetails = memo(({ user, userParticipatedScrims }) => {
  const isAdminJSX = user.isAdmin ? (
    <Tooltip placement="top" title={`${user?.name} is a verified admin`}>
      <span style={{ cursor: 'help', marginLeft: '8px' }}>
        <VerifiedAdminIcon />
      </span>
    </Tooltip>
  ) : null;

  const calcExp = () => {
    if (!userParticipatedScrims.length) return;

    let exp = 0;

    for (let i = 0; i < userParticipatedScrims.length; i++) {
      let scrim = userParticipatedScrims[i];

      // if scrim doesn't have a winning team, skip this and go to the next scrim
      if (!scrim.teamWon) continue;

      let scrimTeams = [...scrim.teamOne, ...scrim.teamTwo];
      let foundPlayer = scrimTeams.find((player) => player._user === user._id);

      let playerTeamName = foundPlayer?.team?.name; // teamOne, teamTwo.
      let playerTeamNumber = playerTeamName.includes('One') ? '1' : '2';
      let winningTeam = scrim.teamWon;
      let playerWon = winningTeam.includes(playerTeamNumber);

      if (playerWon) {
        exp += 2;
      } else {
        exp += 0.5;
      }
    }

    return exp;
  };

  const calcLevel = () => {
    let exp = calcExp(),
      level = 1;

    for (let i = 1; i < exp; i++) {
      //if Number is divisible by 10, level up
      if (i % 10 === 0) level += 1;
    }

    return level;
  };

  return user?._id ? (
    <Grid
      style={{ padding: 0, margin: 0 }}
      container
      direction="column"
      component="ul"
      spacing={1}>
      <Grid item spacing={1} container component="li" alignItems="center">
        <Grid item>
          Name: {user.name} {isAdminJSX}
        </Grid>
        <Grid item>| Level: {calcLevel()}</Grid>
        <Grid item>| EXP: {calcExp()}</Grid>
      </Grid>

      {/* <Grid item>Level: {calcLevel()}</Grid> */}
      <Grid item container component="li" alignItems="center">
        Discord: {user.discord}
      </Grid>

      <Grid item container component="li" alignItems="center">
        Region: {user.region}
      </Grid>

      <Grid item container component="li" alignItems="center">
        Rank: {user.rank}
      </Grid>

      <Grid item container component="li" alignItems="center">
        Joined:&nbsp;<Moment format="MM/DD/yyyy">{user.createdAt}</Moment>
      </Grid>
    </Grid>
  ) : null;
});

const MyCreatedScrims = ({ isCurrentUser, scrims }) => {
  const [filterPrivate, togglePrivate] = useToggle(false);
  const [sortType, setSortType] = useState('date-descending');

  const classes = useProfileStyles();

  const sortedCreatedScrims = useMemo(() => {
    switch (sortType) {
      case 'date-descending':
        return showLatestFirst(scrims);
      case 'date-ascending':
        return showEarliestFirst(scrims);
      default:
        return scrims;
    }
  }, [scrims, sortType]);

  if (!isCurrentUser) return null;
  if (!scrims.length) return null;

  return (
    <>
      <SectionSeparator />

      <Grid
        container
        alignItems="center"
        flexWrap="nowrap"
        justifyContent="space-between"
        direction="row"
        marginTop={2}>
        <Grid item>
          <Typography variant="h1">My Created Scrims</Typography>
        </Grid>
        <Grid item>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel>Sort Scrims</InputLabel>
              <Select
                value={sortType.toString()}
                label="Sort"
                onChange={(e) => {
                  setSortType(e.target.value);
                }}>
                <MenuItem value="date-ascending">Date Ascending</MenuItem>
                <MenuItem value="date-descending">Date Descending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={filterPrivate}
                onChange={togglePrivate}
                name="togglePrivate"
              />
            }
            label="Only show private scrims"
            labelPlacement="bottom"
          />
        </Grid>
      </Grid>
      <ul className={classes.myCreatedScrimsList}>
        {sortedCreatedScrims
          // if filterPrivate is false, just return scrim as is, else filter by scrims that are private
          .filter((scrim) => (!filterPrivate ? scrim : scrim.isPrivate))
          .map((scrim) => (
            <li key={scrim._id}>
              <Tooltip title="Open in new tab">
                <Link
                  className="link"
                  to={`/scrims/${scrim._id}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  {scrim.title} |&nbsp;
                  <Moment format="MM/DD/yyyy hh:mm A">
                    {scrim.gameStartTime}
                  </Moment>
                  &nbsp;| {scrim.region}&nbsp;
                  {scrim?.isPrivate ? '(Private)' : ''}
                </Link>
              </Tooltip>
            </li>
          ))}
      </ul>
    </>
  );
};

const SectionSeparator = () => (
  <>
    <div style={{ display: 'flex', flexGrow: 1, padding: '10px' }} />
    <Divider />
  </>
);
