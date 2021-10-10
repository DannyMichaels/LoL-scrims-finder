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

// services
import {
  getOneUser,
  getUserCreatedScrims,
  getUserParticipatedScrims,
} from '../services/users';

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
        <AccountDetails user={userData} />

        <SectionSeparator />

        {/* My Scrims (will only render if is current user) */}
        <MyCreatedScrims
          isCurrentUser={isCurrentUser}
          scrims={userCreatedScrims}
        />
      </InnerColumn>
    </>
  );
}

const AccountDetails = memo(({ user }) => {
  const isAdminJSX = user.isAdmin ? (
    <Tooltip placement="top" title={`${user?.name} is a verified admin`}>
      <span style={{ cursor: 'help', marginLeft: '8px' }}>
        <VerifiedAdminIcon />
      </span>
    </Tooltip>
  ) : null;

  return user?._id ? (
    <Grid
      style={{ padding: 0, margin: 0 }}
      container
      direction="column"
      component="ul"
      spacing={1}>
      <Grid item container component="li" alignItems="center">
        Name: {user.name} {isAdminJSX}
      </Grid>

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

const MyCreatedScrims = memo(({ isCurrentUser, scrims }) => {
  const [filterPrivate, togglePrivate] = useToggle(false);
  const classes = useProfileStyles();

  if (!isCurrentUser) return null;
  if (!scrims.length) return null;

  return (
    <>
      <Grid
        container
        alignItems="center"
        flexWrap="nowrap"
        justifyContent="space-between"
        direction="row">
        <Grid item>
          <Typography variant="h1">My Created Scrims</Typography>
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
        {scrims
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
});

const SectionSeparator = () => (
  <>
    <div style={{ display: 'flex', flexGrow: 1, padding: '10px' }} />
    <Divider />
  </>
);
