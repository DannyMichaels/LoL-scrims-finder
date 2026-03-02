import { useState, useEffect, useMemo } from 'react';
import useAlerts from '@/hooks/useAlerts';
import useAuth, { useAuthActions } from '@/features/auth/hooks/useAuth';
import useUsers from '@/features/users/hooks/useUsers';

// components
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Navbar from '@/components/shared/Navbar/Navbar';
import {
  InnerColumn,
  PageContent,
} from '@/components/shared/PageComponents';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

// icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// services & utils
import { updateUser } from '@/features/auth/services/auth.services';
import { setAuthToken } from '@/features/auth/services/auth.services';

// remove spaces from # in discord name
const removeSpaces = (str) => {
  return str
    .trim()
    .replace(/\s([#])/g, function (el1, el2) {
      return '' + el2;
    })
    .replace(/(«)\s/g, function (el1, el2) {
      return el2 + '';
    });
};

// userEdit
export default function Settings() {
  const { currentUser } = useAuth();
  const { setCurrentUser } = useAuthActions();
  const { allUsers } = useUsers();

  const [isAdminKeyHidden, setIsAdminKeyHidden] = useState(true);

  const [userData, setUserData] = useState({
    name: currentUser?.name, // LoL summoner name
    summonerTagline: currentUser?.summonerTagline || '',
    discord: currentUser?.discord,
    adminKey: currentUser?.adminKey ?? '',
    region: currentUser?.region ?? 'NA',
    canSendEmailsToUser: currentUser?.canSendEmailsToUser ?? false,
    ...currentUser,
  });

  const { setCurrentAlert } = useAlerts();

  const [rankData, setRankData] = useState({
    rankDivision: currentUser?.rank?.replace(/[0-9]/g, '').trim(),
    rankNumber: currentUser?.rank?.replace(/[a-z]/gi, '').trim(),
  });

  const divisionsWithNumbers = [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Emerald',
    'Diamond',
  ];

  const usersInRegion = useMemo(
    () => allUsers.filter((user) => user?.region === userData?.region),
    [allUsers, userData?.region]
  );

  const foundUserSummonerName = useMemo(
    () =>
      usersInRegion.find(
        ({ name, _id }) => {
          if (_id === currentUser?._id) return false;
          return name === userData.name;
        }
      ),
    [userData.name, usersInRegion, currentUser?._id]
  );

  const foundUserDiscord = useMemo(
    () =>
      allUsers.find(({ discord, _id }) => {
        if (_id === currentUser?._id) return false;
        return removeSpaces(discord) === removeSpaces(userData.discord);
      }),
    [userData.discord, allUsers, currentUser?._id]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (foundUserSummonerName) {
      setCurrentAlert({
        type: 'Error',
        message: `Summoner name ${userData.name} in ${userData.region} is already taken!`,
      });
      return;
    }

    if (foundUserDiscord) {
      setCurrentAlert({
        type: 'Error',
        message: `Discord name ${userData.discord} is already taken!`,
      });
      return;
    }

    try {
      const data = await updateUser({
        ...userData,
        name: userData.name.trim(),
      });

      if (data?.token) {
        const { token } = data;
        localStorage.setItem('jwtToken', token);
        setAuthToken(token);
        let updatedUser = data?.user;
        setCurrentUser(updatedUser);
        setUserData({ ...updatedUser });
        setCurrentAlert({
          type: 'Success',
          message: 'Account details updated!',
        });
      }
    } catch (error) {
      console.error('ERROR:', error);
      const errMsg = error?.messasge ?? error?.response?.data?.error;

      setCurrentAlert({
        type: 'Error',
        message: errMsg ?? JSON.stringify(error),
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    const { rankNumber, rankDivision } = rankData;
    let isDivisionWithNumber = divisionsWithNumbers.includes(rankDivision);

    let rankResult = isDivisionWithNumber
      ? `${rankDivision} ${rankNumber === '' ? '4' : rankNumber}`
      : rankDivision;

    setUserData((prevState) => ({
      ...prevState,
      rank: rankResult,
    }));

    return () => {
      setUserData((prevState) => ({
        ...prevState,
        rank: rankResult,
      }));
    };
    // eslint-disable-next-line
  }, [rankData]);

  return (
    <>
      <Navbar showLess />
      <PageContent>
        <InnerColumn>
          <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
            <Typography variant="h2" sx={{ mb: 1 }}>
              Settings
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              Update your account details below.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Row 1: Summoner Name + Tagline */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={7}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      name="name"
                      value={userData.name || ''}
                      onKeyPress={(e) => {
                        if (!/^[0-9a-zA-Z \b]+$/.test(e.key)) e.preventDefault();
                      }}
                      onChange={handleChange}
                      label="Summoner Name"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      name="summonerTagline"
                      value={userData.summonerTagline || ''}
                      onKeyPress={(e) => {
                        if (!/^[0-9a-zA-Z\b]+$/.test(e.key)) e.preventDefault();
                      }}
                      onChange={(e) => {
                        const value = e.target.value.replace('#', '');
                        handleChange({
                          ...e,
                          target: { ...e.target, name: 'summonerTagline', value }
                        });
                      }}
                      label="Tagline"
                      helperText="Without #"
                      inputProps={{ maxLength: 5 }}
                      required
                    />
                  </Grid>
                </Grid>

                {/* Row 2: Discord + Region */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={7}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      name="discord"
                      value={userData.discord || ''}
                      onChange={handleChange}
                      label="Discord Username"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Region</InputLabel>
                      <Select
                        name="region"
                        value={userData.region}
                        label="Region"
                        onChange={handleChange}
                        required>
                        {['NA', 'EUW', 'EUNE', 'LAN', 'OCE'].map((region) => (
                          <MenuItem value={region} key={region}>
                            {region}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Row 3: Rank Division + Number */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={divisionsWithNumbers.includes(rankData.rankDivision) ? 7 : 12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Rank Division</InputLabel>
                      <Select
                        name="rankDivision"
                        required
                        value={rankData.rankDivision}
                        label="Rank Division"
                        onChange={(e) =>
                          setRankData((prevState) => ({
                            ...prevState,
                            [e.target.name]: e.target.value,
                          }))
                        }>
                        {[
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
                        ].map((value) => (
                          <MenuItem value={value} key={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {divisionsWithNumbers.includes(rankData.rankDivision) && (
                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Rank Number</InputLabel>
                        <Select
                          name="rankNumber"
                          required
                          value={rankData.rankNumber || '4'}
                          label="Rank Number"
                          onChange={(e) =>
                            setRankData((prevState) => ({
                              ...prevState,
                              [e.target.name]: e.target.value,
                            }))
                          }>
                          <MenuItem value={4}>4</MenuItem>
                          <MenuItem value={3}>3</MenuItem>
                          <MenuItem value={2}>2</MenuItem>
                          <MenuItem value={1}>1</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>

                {/* Row 4: Admin Key */}
                <TextField
                  fullWidth
                  variant="outlined"
                  type={isAdminKeyHidden ? 'password' : 'text'}
                  name="adminKey"
                  value={userData.adminKey || ''}
                  onChange={handleChange}
                  label="Admin Key"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle admin key visibility"
                          onClick={() =>
                            setIsAdminKeyHidden((prevState) => !prevState)
                          }
                          onMouseDown={(e) => e.preventDefault()}>
                          {isAdminKeyHidden ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Email opt-in */}
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={() =>
                        setUserData((prevState) => ({
                          ...prevState,
                          canSendEmailsToUser: !userData.canSendEmailsToUser,
                        }))
                      }
                      checked={userData.canSendEmailsToUser}
                    />
                  }
                  label="Send me emails regarding app updates and/or notifications"
                />

                {/* Submit */}
                <Button variant="contained" color="primary" type="submit">
                  Save Changes
                </Button>
              </Box>
            </form>
          </Box>
        </InnerColumn>
      </PageContent>
    </>
  );
}
