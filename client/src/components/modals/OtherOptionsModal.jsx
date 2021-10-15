import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import makeStyles from '@mui/styles/makeStyles';

// components
import { Modal } from '../shared/ModalComponents';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import AdminArea from '../shared/AdminArea';
import Tooltip from '../shared/Tooltip';

// icons
import FriendsIcon from '@mui/icons-material/SupervisorAccount';
import FriendRequestsIcon from '@mui/icons-material/AddReaction';
import CreateIcon from '@mui/icons-material/BorderColor';

export default function MoreOptionsModal() {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();

  const { moreOptionsModalOpen } = useSelector(({ general }) => general);
  const history = useHistory();
  const dispatch = useDispatch();

  const openFriendsModal = useCallback(() => {
    dispatch({
      type: 'general/openFriendsModal',
      payload: {
        user: currentUser,
        friends: currentUser.friends,
      },
    });
  }, [currentUser, dispatch]);

  const openFriendRequestsModal = useCallback(() => {
    dispatch({
      type: 'general/openFriendRequests',
    });
  }, [dispatch]);

  const onClose = useCallback(() => {
    dispatch({
      type: 'general/closeOtherOptionsModal',
    });
  }, [dispatch]);

  useEffect(() => {
    onClose(); // close on path change

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Modal title="Other" onClose={onClose} open={moreOptionsModalOpen}>
      <Grid
        container
        direction="row"
        flexWrap="wrap"
        justifyContent="space-evenly">
        <IconGroup
          tooltipTitle="Open friends"
          title="Friends"
          Icon={FriendsIcon}
          onClick={openFriendsModal}
        />

        <IconGroup
          tooltipTitle="Open friend requests received"
          title="Friend Requests"
          counter={currentUser.friendRequests.length}
          Icon={FriendRequestsIcon}
          onClick={openFriendRequestsModal}
        />

        <AdminArea>
          <IconGroup
            tooltipTitle="Redirect to create scrim page"
            title="Create Scrim"
            Icon={CreateIcon}
            onClick={() => {
              onClose();
              history.push('/scrims/new');
            }}
          />
        </AdminArea>
      </Grid>
    </Modal>
  );
}

const IconGroup = ({ title, Icon, onClick, tooltipTitle, counter }) => {
  const classes = useStyles();

  return (
    <Grid
      item
      xs={4}
      container
      direction="column"
      alignItems="center"
      style={{ position: 'relative' }}>
      <Tooltip title={tooltipTitle}>
        <Grid item>
          <IconButton onClick={onClick}>
            {counter > 0 ? (
              <div className={classes.countCircle}>{counter}</div>
            ) : null}
            <Icon fontSize="large" />
          </IconButton>
        </Grid>
      </Tooltip>

      <Grid item>
        <span className={classes.spanText}>{title}</span>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles({
  countCircle: {
    backgroundColor: 'red',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    position: 'absolute',
    top: '0px',
    right: '-5px',
    fontSize: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  spanText: {
    display: 'block',
    cursor: 'default',
    fontSize: '0.6rem',
    color: '#FAFAFA',
    textAlign: 'center',
  },
});
