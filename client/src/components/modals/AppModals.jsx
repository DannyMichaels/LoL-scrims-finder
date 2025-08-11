import { useSelector } from 'react-redux';

import useAuth from '@/features/auth/hooks/useAuth';
import FriendRequestsModal from '@/features/users/modals/FriendRequestsModal';
import NotificationsModal from './NotificationsModal';
import UserFriendsModal from '@/features/users/modals/UserFriendsModal';
import ChatRoomModal from '@/features/messenger/modals/ChatRoomModal';
import ScrimChatRoomModal from '@/features/messenger/modals/ScrimChatRoomModal';
import ConversationCreateModal from '@/features/messenger/modals/ConversationCreateModal';

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
