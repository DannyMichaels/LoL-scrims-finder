const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const getThirtyMinFromNow = () => {
  let now = Date.now();
  let d1 = new Date(now).toISOString();
  let d2 = new Date(d1);
  d2.setMinutes(new Date(d1).getMinutes() + 30);
  return d2;
};

const ImageSchema = new Schema({
  bucket: { type: String, required: false },
  key: { type: String, required: false },
  location: { type: String, required: false },
  result: { type: Object, required: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // will only show up as user._id if not populated
});

const PlayerSchema = new Schema({
  role: { type: String },
  team: { name: { type: String } },

  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Scrim = new Schema(
  {
    teamOne: { type: [PlayerSchema], default: [] }, // an array of players
    teamTwo: { type: [PlayerSchema], default: [] }, // an array of players
    casters: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      min: 0,
      max: 2,
    },
    title: { type: String, required: true },
    gameStartTime: {
      type: Date,
      default: getThirtyMinFromNow(),
      required: true,
    },
    lobbyHost: { type: Object, default: null },
    lobbyPassword: { type: String, required: true },
    lobbyHost: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'User',
    },
    lobbyName: {
      type: String,
    },
    region: {
      type: String,
      default: 'NA',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    teamWon: { type: 'String', default: null },
    postGameImage: { type: ImageSchema }, // image of the post-game lobby
    isPrivate: false, // if it's private, only people with share link can see.
    _conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
  },
  { timestamps: true, optimisticConcurrency: true, versionKey: 'version' }
);

module.exports = mongoose.model('Scrim', Scrim, 'scrims');
