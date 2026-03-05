const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
  slot: { type: Number, min: 0, max: 4, required: true },
  role: { type: String },
  displayName: { type: String },
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  champion: { type: String, default: null },
});

const TeamSchema = new Schema({
  name: { type: String, required: true },
  side: { type: String, enum: ['blue', 'red'], required: true },
  players: { type: [PlayerSchema], default: [] },
  _captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ready: { type: Boolean, default: false },
});

const ActionSchema = new Schema({
  actionIndex: { type: Number, required: true },
  type: { type: String, enum: ['ban', 'pick'], required: true },
  team: { type: String, enum: ['blue', 'red'], required: true },
  phase: { type: String },
  championId: { type: String, default: null },
  championName: { type: String, default: null },
  playerSlot: { type: Number, default: null },
  simultaneous: { type: Boolean, default: false },
  _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date, default: null },
  wasAutoCompleted: { type: Boolean, default: false },
});

const SwapRequestSchema = new Schema(
  {
    fromSlot: { type: Number, required: true },
    toSlot: { type: Number, required: true },
    team: { type: String, enum: ['blue', 'red'], required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const PreviouslyPickedSchema = new Schema({
  championId: { type: String, required: true },
  team: { type: String, enum: ['blue', 'red'], required: true },
  gameNumber: { type: Number, required: true },
});

const Draft = new Schema(
  {
    mode: {
      type: String,
      enum: ['captain', 'individual'],
      required: true,
    },

    blueTeam: { type: TeamSchema, required: true },
    redTeam: { type: TeamSchema, required: true },

    status: {
      type: String,
      enum: [
        'waiting',
        'ready',
        'in_progress',
        'swap_phase',
        'completed',
        'cancelled',
      ],
      default: 'waiting',
    },

    actions: { type: [ActionSchema], default: [] },
    currentActionIndex: { type: Number, default: 0 },

    // Timer
    timerDuration: { type: Number, default: 30 },
    timerExpiresAt: { type: Date, default: null },

    // Swap phase
    swapPhaseExpiresAt: { type: Date, default: null },
    swapRequests: { type: [SwapRequestSchema], default: [] },

    // Scrim link (optional)
    _scrim: { type: mongoose.Schema.Types.ObjectId, ref: 'Scrim' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Fearless mode
    fearlessMode: {
      type: String,
      enum: ['off', 'soft', 'hard'],
      default: 'off',
    },
    seriesId: { type: String, default: null },
    gameNumber: { type: Number, default: 1 },
    previouslyPickedChampions: {
      type: [PreviouslyPickedSchema],
      default: [],
    },

    // Individual mode: track simultaneous ban submissions
    pendingBans: {
      type: Map,
      of: new Schema({
        championId: String,
        championName: String,
        team: String,
        playerSlot: Number,
      }),
      default: new Map(),
    },
    // How many bans expected in current simultaneous phase
    expectedBanCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

Draft.index({ _scrim: 1 });
Draft.index({ status: 1 });
Draft.index({ seriesId: 1, gameNumber: 1 });
Draft.index({ createdBy: 1 });

module.exports = mongoose.model('Draft', Draft, 'drafts');
