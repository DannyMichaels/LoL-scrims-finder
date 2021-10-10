import Navbar from '../components/shared/Navbar/Navbar';
import Grid from '@mui/material/Grid';
import { useSelector } from 'react-redux';

export default function MyProfile() {
  const { currentUser } = useSelector(({ auth }) => auth);

  return (
    <>
      <Navbar showLess />
      <Grid container direction="column">
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      </Grid>
    </>
  );
}
