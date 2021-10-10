import { useState, useEffect, useMemo, memo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';

// components
import Navbar from '../components/shared/Navbar/Navbar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Loading from '../components/shared/Loading';
import { InnerColumn } from '../components/shared/PageComponents';
import Tooltip from '../components/shared/Tooltip';
import Moment from 'react-moment';

// services
import { getOneUser, getUserCreatedScrims } from '../services/users';

// icons
import VerifiedAdminIcon from '@mui/icons-material/VerifiedUser';

export default function UserProfile() {
  const { currentUser } = useSelector(({ auth }) => auth);
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

  let titleText = useMemo(() => {
    // if the user in the page is the current user, say "My Profile"
    if (isCurrentUser) return 'My Profile';
    return `${userData?.name}'s Profile`; // else say "Bob's  Profile" or whatever
  }, [isCurrentUser, userData?.name]);

  useEffect(() => {
    const fetchUserData = async () => {
      const fetchedUserData = await getOneUser(id);
      setUserData(fetchedUserData);

      const userCreatedScrims = await getUserCreatedScrims(id);
      setUserCreatedScrims(userCreatedScrims);

      setIsLoaded(true);
    };

    fetchUserData();
  }, [id]);

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
  if (!isCurrentUser) return null;

  return <pre>{JSON.stringify(scrims, null, 2)}</pre>;
});
