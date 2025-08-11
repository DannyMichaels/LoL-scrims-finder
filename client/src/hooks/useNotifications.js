// hooks
import { useEffect } from 'react';
import useSocket from './useSocket';
import useAuth from './useAuth';
import { useDispatch, useSelector } from 'react-redux';

// utils
import devLog from './../utils/devLog';

// services
import { getUserById } from '../services/users.services';
import { getUserNotifications } from '../services/notification.services';

export default function useNotifications() {
  const { socket } = useSocket();
  const { currentUser } = useAuth();
  const dispatch = useDispatch();

  const { notificationsOpen } = useSelector(({ general }) => general);

  useEffect(() => {
    if (!socket) return;
    if (!currentUser?._id) return;
    
    // Register user with socket for notifications
    socket.emit('addUser', currentUser._id);
    
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // listen to socket server and get notification data.
    socket.on('getNotification', async (data) => {
      devLog('socket getNotification event: ', data);
      if (currentUser._id === data.receiverId) {
        const newNotification = {
          message: data.message,
          createdAt: Date.now(),
          createdDate: Date.now(), // i added this timestamp on backend for some reason...
          _relatedUser: data?._relatedUser ?? null,
          _relatedScrim: data?.relatedScrim ?? null,
          isConversationStart: data?.isConversationStart ?? false,
          isFriendRequest: data?.isFriendRequest ?? false,
          conversation: data?.conversation ?? null,
        };

        // add it to the currentUsers notifications array.
        dispatch({
          type: 'auth/addNotification',
          payload: newNotification,
        });

        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          let notificationTitle = 'New Notification';
          let notificationBody = data.message;
          
          // Customize notification based on type
          if (newNotification.isFriendRequest) {
            notificationTitle = 'Friend Request';
          } else if (newNotification.isConversationStart) {
            notificationTitle = 'New Message';
          } else if (newNotification.message.includes('are now friends')) {
            notificationTitle = 'New Friend';
          }
          
          const notification = new Notification(notificationTitle, {
            body: notificationBody,
            icon: '/reluminate-logo.png',
            tag: `notification-${Date.now()}`,
            requireInteraction: false,
          });
          
          // Handle click on browser notification
          notification.onclick = () => {
            window.focus();
            notification.close();
            
            // Open the notifications modal
            dispatch({ type: 'general/openNotifications' });
            
            // Navigate to specific page based on notification type
            if (newNotification.isFriendRequest) {
              dispatch({ type: 'general/openFriendRequests' });
            } else if (newNotification.isConversationStart && newNotification.conversation) {
              dispatch({
                type: 'general/chatRoomOpen',
                payload: {
                  conversation: newNotification.conversation,
                  isOpen: true,
                },
              });
            }
          };
        }

        // add new user to the current user friends array
        if (newNotification?.message.includes('are now friends')) {
          const friendUser = await getUserById(newNotification?._relatedUser);
          dispatch({
            type: 'auth/updateCurrentUser',
            payload: { friends: [...currentUser?.friends, friendUser] },
          });
        }
      }
    });
    
    // Listen for scrim start notifications
    socket.on('scrimStartNotification', async (data) => {
      devLog('socket scrimStartNotification event: ', data);
      
      // The notification is already saved in DB, just fetch fresh data
      const { notifications } = await getUserNotifications(currentUser?._id);
      dispatch({ type: 'auth/updateCurrentUser', payload: { notifications } });
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('Scrim Starting!', {
          body: data.message,
          icon: '/reluminate-logo.png',
          tag: `scrim-${data.scrimId}`,
          requireInteraction: false,
        });
        
        // Handle click on browser notification
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Navigate to scrim detail page
          window.location.href = `/scrims/${data.scrimId}`;
        };
      }
    });

    // Cleanup socket listeners
    return () => {
      socket.off('getNotification');
      socket.off('scrimStartNotification');
    };
    
    //  eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, currentUser?._id, dispatch]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?._id) return;
      devLog('fetching notifications for currentUser');

      const { notifications } = await getUserNotifications(currentUser?._id);

      // update the user in the state
      dispatch({ type: 'auth/updateCurrentUser', payload: { notifications } });
    };

    // Only fetch on initial mount and when modal opens
    // Socket events will handle real-time updates
    if (currentUser?._id) {
      fetchNotifications();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id, notificationsOpen]); // refetch when opening modal

  return null;
}
