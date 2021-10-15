import { memo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from '../shared/ModalComponents';
import Tooltip from '../shared/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';

// utils
import { getRankImage } from './../../utils/getRankImage';

// services
import { removeUserFriend } from './../../services/users';

// icons
import CancelIcon from '@mui/icons-material/Cancel';

export default function UserFriendsModal() {
  const [
    {
      friendsModalOpen: { friends, user },
    },
    { allUsers },
    { currentUser },
  ] = useSelector(({ general, users, auth }) => [general, users, auth]);

  const dispatch = useDispatch();

  const onClose = useCallback(() => {
    dispatch({ type: 'general/closeFriendsModal' });
  }, [dispatch]);

  const onDeleteFriend = useCallback(
    async (friendId) => {
      const { userFriends } = await removeUserFriend(
        currentUser?._id,
        friendId
      );

      dispatch({
        type: 'auth/updateCurrentUser',
        payload: {
          friends: userFriends,
        },
      });

      // update the state in the modal as well
      dispatch({
        type: 'general/openFriendsModal',
        payload: {
          user: currentUser,
          friends: userFriends,
        },
      });
    },
    [dispatch, currentUser]
  );

  if (!user) return null;
  if (!friends) return null;

  return (
    <Modal title={`${user?.name}'s Friends`} open={friends} onClose={onClose}>
      {friends?.length > 0 ? (
        friends?.map((friend) => (
          <OneFriend
            key={friend?._id}
            user={user}
            currentUser={currentUser}
            onClose={onClose}
            onDeleteFriend={onDeleteFriend}
            friend={allUsers.find(({ _id }) => _id === friend?._id)}
          />
        ))
      ) : (
        <Typography
          variant="h6"
          textAlign="center"
          style={{ fontSize: '1rem' }}>
          No friends found
        </Typography>
      )}
    </Modal>
  );
}

const OneFriend = memo(
  ({ friend, onClose, user, currentUser, onDeleteFriend }) => {
    return (
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item container alignItems="center" xs={10}>
          <Link
            onClick={onClose}
            className="link"
            to={`/users/${friend.name}?region=${friend.region}`}>
            <img src={getRankImage(friend)} alt={friend.rank} width="20" />
            &nbsp;
            <span>{friend.name}</span>
            <span>({friend.region})</span>
          </Link>
        </Grid>

        {user?._id === currentUser?._id && (
          <Grid item container alignItems="center" xs={2}>
            <Tooltip title={`Unfriend ${friend.name}`}>
              <IconButton onClick={() => onDeleteFriend(friend._id)}>
                <CancelIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Grid>
        )}
      </Grid>
    );
  }
);
