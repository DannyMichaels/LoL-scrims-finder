import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const FIELD_LABELS = {
  name: 'Summoner Name',
  summonerTagline: 'Tagline',
  rank: 'Rank',
  region: 'Region',
  discord: 'Discord',
};

export default function SignUpForms({
  handleChange,
  currentFormIndex,
  userData,
  setUserData,
  rankData,
  setRankData,
  divisionsWithNumbers,
}) {
  const nameDiscordAndRegionForm = (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          variant="outlined"
          type="text"
          name="name"
          value={userData.name}
          onChange={(e) => handleChange(e, setUserData)}
          onKeyPress={(e) => {
            if (!/^[0-9a-zA-Z \b]+$/.test(e.key)) e.preventDefault();
          }}
          label="Summoner Name"
          helperText="Required"
          required
        />
      </Grid>

      <Grid item xs={12} sm={6} md={2}>
        <TextField
          fullWidth
          variant="outlined"
          type="text"
          name="summonerTagline"
          value={userData.summonerTagline}
          onChange={(e) => {
            const value = e.target.value.replace('#', '');
            handleChange({
              ...e,
              target: { ...e.target, name: 'summonerTagline', value }
            }, setUserData);
          }}
          onKeyPress={(e) => {
            if (!/^[0-9a-zA-Z\b]+$/.test(e.key)) e.preventDefault();
          }}
          label="Tagline"
          helperText="Without # (e.g. NA1)"
          inputProps={{ maxLength: 5 }}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Region</InputLabel>
          <Select
            name="region"
            value={userData.region}
            label="Region"
            onChange={(e) => handleChange(e, setUserData)}
            required>
            {['NA', 'EUW', 'EUNE', 'LAN', 'OCE'].map((region) => (
              <MenuItem value={region} key={region}>
                {region}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          variant="outlined"
          type="text"
          name="discord"
          value={userData.discord}
          onChange={(e) => handleChange(e, setUserData)}
          label="Discord Username"
          helperText="e.g. .gitcat or GitCat#0000"
          required
        />
      </Grid>
    </Grid>
  );

  const rankForm = (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Rank Division</InputLabel>
          <Select
            name="rankDivision"
            required
            value={rankData.rankDivision}
            label="Rank Division"
            onChange={(e) => handleChange(e, setRankData)}>
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
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Rank Number</InputLabel>
            <Select
              name="rankNumber"
              required
              value={rankData.rankNumber}
              label="Rank Number"
              onChange={(e) => handleChange(e, setRankData)}>
              <MenuItem value={4}>4</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={1}>1</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
    </Grid>
  );

  const verificationForm = (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Account Details
      </Typography>

      <Grid container spacing={1.5}>
        {Object.entries(userData).map(
          ([k, v]) =>
            k !== 'canSendEmailsToUser' && (
              <Grid item xs={12} sm={6} key={k}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                  {FIELD_LABELS[k] || k}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {v || '—'}
                </Typography>
              </Grid>
            )
        )}
      </Grid>

      <Box sx={{ mt: 2 }}>
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
      </Box>

      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
        If everything looks correct, click "Create my account with Google" below.
      </Typography>
    </Box>
  );

  let forms = [nameDiscordAndRegionForm, rankForm, verificationForm];

  return (
    <Box sx={{ py: 3 }}>
      {forms[currentFormIndex]}
    </Box>
  );
}
