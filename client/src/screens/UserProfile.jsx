import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

// components
import Navbar from '../components/shared/Navbar/Navbar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Loading from '../components/shared/Loading';
import { InnerColumn } from '../components/shared/PageComponents';
import Tooltip from '../components/shared/Tooltip';
import Moment from 'react-moment';

// utils
import { getOneUser, getUserCreatedScrims } from '../services/users';
import { useParams } from 'react-router-dom';

// icons
import VerifiedAdminIcon from '@mui/icons-material/VerifiedUser';

export default function UserProfile() {
  const { currentUser } = useSelector(({ auth }) => auth);
  const [userData, setUserData] = useState(null);
  const [userCreatedScrims, setUserCreatedScrims] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { id } = useParams();

  let titleText = useMemo(() => {
    if (userData?._id === currentUser?._id) return 'My Profile';
    return `${userData?.name}'s Profile`;
  }, [userData, currentUser]);

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
      <Navbar showLess />
      <InnerColumn>
        <Typography variant="h1">{titleText}</Typography>

        {/* User Details */}
        <AccountDetails user={userData} />
      </InnerColumn>
    </>
  );
}

const AccountDetails = ({ user }) => {
  const isAdminJSX =
    user.adminKey === process.env.REACT_APP_ADMIN_KEY ? (
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
};
