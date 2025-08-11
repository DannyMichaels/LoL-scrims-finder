import { useState, useMemo, useEffect } from 'react';
import useAlerts from '@/hooks/useAlerts';

// components
import { Modal } from '@/components/shared/ModalComponents';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import UserRankFields from '@/features/users/components/forms/UserRankFields';

// services
import { updateUserAsAdmin } from '@/features/admin/services/admin.services';

export default function EditUserModal({
  isOpen,
  openModal,
  onClose,
  modalTitle,
  user,
  setUser,
  fieldToEdit,
  onUserUpdate,
}) {
  const initialRankDataState = {
    rankDivision: user?.rank?.replace(/[0-9]/g, '').trim(), // match letters, trim spaces.
    rankNumber: user?.rank?.replace(/[a-z]/gi, '').trim(), // match numbers
  };

  const [rankData, setRankData] = useState(initialRankDataState);
  const [summonerName, setSummonerName] = useState(user?.name || '');
  const [tagline, setTagline] = useState(user?.summonerTagline || '');

  const { setCurrentAlert } = useAlerts();

  const resetInputs = () => {
    setRankData(initialRankDataState);
    setSummonerName(user?.name || '');
    setTagline(user?.summonerTagline || '');
  };

  const onSaveClick = async () => {
    let body = {};

    if (fieldToEdit === 'summonerName') {
      body.name = summonerName;
    } else if (fieldToEdit === 'tagline') {
      body.summonerTagline = tagline;
    } else {
      // Default to rank editing for backward compatibility
      body.rank = createRankFromRankData(rankData);
    }

    const updatedUser = await updateUserAsAdmin(
      user?._id,
      body,
      setCurrentAlert
    );

    setUser((prevState) => ({
      ...prevState,
      ...updatedUser,
    }));

    // Call onUserUpdate callback if provided (for URL updates)
    if (onUserUpdate && fieldToEdit) {
      onUserUpdate(updatedUser, fieldToEdit);
    }

    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        resetInputs();
      }, 250);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Update state when user prop changes
  useEffect(() => {
    setSummonerName(user?.name || '');
    setTagline(user?.summonerTagline || '');
  }, [user?.name, user?.summonerTagline]);

  const renderFieldsJSX = useMemo(() => {
    if (openModal === 'rank') {
      return <UserRankFields rankData={rankData} setRankData={setRankData} />;
    }
    
    if (openModal === 'summonerName') {
      return (
        <Grid item>
          <TextField
            label="Summoner Name"
            value={summonerName}
            onChange={(e) => setSummonerName(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Enter summoner name"
            helperText="This will update the user's display name and summoner name"
          />
        </Grid>
      );
    }
    
    if (openModal === 'tagline') {
      return (
        <Grid item>
          <TextField
            label="Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Enter tagline (e.g., NA1, EUW)"
            helperText="Riot's new tagline system identifier"
          />
        </Grid>
      );
    }

    return <></>;
  }, [openModal, rankData, setRankData, summonerName, tagline]);

  if (!isOpen) return null;

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onClose={onClose}
      closeBtnTitle="Close"
      actionButtonProps={{
        onClick: () => {
          onSaveClick();
        },
        title: 'Save',

        appearance: {
          // disabled: submitDisabled,
        },
      }}>
      <Grid
        container
        alignItems="center"
        direction="column"
        justifyContent="center"
        sx={{
          paddingTop: '20px',
          paddingBottom: '20px',
          paddingLeft: '10px',
          paddingRight: '10px',
        }}>
        <Grid
          container
          alignItems="center"
          direction="row"
          justifyContent="center"
          spacing={4}
          sx={{
            paddingTop: '5px',
            paddingBottom: '5px',
            paddingLeft: '10px',
            paddingRight: '10px',
          }}>
          {renderFieldsJSX}
        </Grid>
      </Grid>
    </Modal>
  );
}

function createRankFromRankData(rankData) {
  const divisionsWithNumbers = [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Emerald',
    'Diamond',
  ];

  const { rankNumber, rankDivision } = rankData;
  let isDivisionWithNumber = divisionsWithNumbers.includes(rankDivision);

  let rankResult = isDivisionWithNumber
    ? `${rankDivision} ${rankNumber === '' ? '4' : rankNumber}`
    : rankDivision;

  return rankResult;
}
