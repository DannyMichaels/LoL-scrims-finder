import { useSelector } from 'react-redux';

import useAuth from './../../hooks/useAuth';
import FriendRequestsModal from './FriendRequestsModal';
import NotificationsModal from './NotificationsModal';
import UserFriendsModal from './UserFriendsModal';
import ChatRoomModal from './ChatRoomModal';
import ScrimChatRoomModal from './ScrimChatRoomModal';
import ConversationCreateModal from './ConversationCreateModal';

export default function AppModals() {
  const { currentUser } = useAuth();
  const {
    chatRoomOpen,
    scrimChatRoomOpen,
    conversationCreateModalOpen,
    friendRequestsOpen,
  } = useSelector(({ general }) => general);

  if (!currentUser?._id) return null;

  return (
    <>
      {/* these components  do rerender so we need these guard operators for each one for now */}
      {friendRequestsOpen && <FriendRequestsModal />}
      {/* actually, we can just use memo on them, we can also use connect instead of useSelector (with React.memo) */}
      <NotificationsModal />
      <UserFriendsModal />
      {chatRoomOpen?.isOpen && <ChatRoomModal />}
      {scrimChatRoomOpen?.isOpen && <ScrimChatRoomModal />}
      {conversationCreateModalOpen?.isOpen && <ConversationCreateModal />}
    </>
  );
}
