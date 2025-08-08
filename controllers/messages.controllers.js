const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');

const mongoose = require('mongoose');

const handleValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// @route   POST /api/messages
// @desc    post a new message
// @access  Private
const postMessage = async (req, res) => {
  try {
    const { text, conversationId, receiverId } = req.body;
    const senderId = req.user._id ?? '';

    if (!handleValidId(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }
    if (!handleValidId(senderId)) {
      return res.status(400).json({ error: 'Invalid sender ID' });
    }

    const conversation = await Conversation.findById(conversationId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found!' });
    }

    if (!text) {
      return res.status(400).json({ error: 'Message text not provided!' });
    }

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found!' });
    }

    const newMessage = new Message({
      text,
      _conversation: conversation._id,
      _sender: sender._id,
      _seenBy: [sender._id],
      _receiver: receiverId,
    });

    let savedMessage = await newMessage.save();

    // make sure we get _sender.name, region, rank etc after creating with populate, or else it will only return id to the client
    savedMessage = await Message.findById(savedMessage._id)
      .populate('_sender', ['name', 'discord', 'rank', 'region']);

    return res.status(200).json(savedMessage);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/messages/:conversationId
// @desc    get the messages of the conversation by conversation._id
// TODO: there should be a check for if it's a scrim conversation make it public, else make it private if it's private DM
// @access  Public
const getConversationMessages = async (req, res) => {
  try {
    const messagesData = await Message.find({
      _conversation: req.params.conversationId,
    })
      .populate('_sender', ['name', 'discord', 'region', 'rank'])
      .exec();

    return res.status(200).json(messagesData);
  } catch (error) {
    console.log('Error fetching conversation messages:', error);
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST /api/messages/post-seen/:messageId
// @desc    post that the message has been seen by the currentUser
// @access  Private
const postMessageSeenByUser = async (req, res) => {
  try {
    const { messageId } = req.params;
    const seenByUserId = req.user._id ?? false;

    if (!handleValidId(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    if (!seenByUserId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    let message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!message._seenBy) {
      message._seenBy = [];
    }

    // Only add if not already seen
    if (!message._seenBy.includes(seenByUserId)) {
      message._seenBy = [...message._seenBy, seenByUserId];
    }

    const savedMessage = await message.save();

    return res.status(200).json({ updatedMessage: savedMessage, status: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/messages/unseen-messages/:userId
// @desc    get the messages that the user didn't see by user._id
// @access  Private
const getUserUnseenMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!handleValidId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const currentUser = await User.findById(userId).select(['friends']);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const messages = await Message.find({ _receiver: userId });

    const friendIds = currentUser.friends?.map(({ _id }) => _id) || [];

    const unseenMessages = messages.filter((message) => {
      if (!message?._seenBy.some((id) => friendIds.includes(id))) return false; // if not friend, return false. (if unfriended)

      return !message?._seenBy?.includes(userId); // return if is friend and user didn't see it.
    });

    return res.status(200).json(unseenMessages);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  postMessage,
  getConversationMessages,
  postMessageSeenByUser,
  getUserUnseenMessages,
};
