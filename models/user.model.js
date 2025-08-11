const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Friend, FriendRequest } = require('./friend.model');
const Notification = require('./notification.model');
const Ban = require('./ban.model').schema;
const LoginInfo = require('./login-info.model').schema;

const User = new Schema(
  {
    name: {
      // LoL summoner name (without tagline)
      type: String,
      required: true,
    },
    summonerTagline: {
      // Riot tagline (e.g., "NA1", "2737", etc.)
      type: String,
      required: false, // Making it optional for backwards compatibility
      default: '', // Will be set in pre-save hook if not provided
    },
    discord: { type: String, required: true, unique: true },
    rank: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    adminKey: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    uid: { type: String, required: true, unique: true }, // google id
    email: { type: String, required: true, unique: true }, // google email.
    notifications: { type: [Notification] },

    // friends
    friendRequests: { type: [FriendRequest] },
    friends: { type: [Friend] },

    // profile customization
    profileBackgroundImg: { type: String, default: 'Summoners Rift' },
    profileBackgroundBlur: { type: String, default: '20' },

    // can we send them an email?
    canSendEmailsToUser: { type: Boolean, default: false },

    // when is the last time they signed in?
    lastLoggedIn: { type: Date },

    currentBan: {
      isActive: {
        type: Boolean,
        default: false,
      },
      dateFrom: {
        type: Date,
        default: null,
        required: false,
      },
      dateTo: {
        type: Date,
        default: null,
        required: false,
      },
      _bannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
      _ban: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ban',
        required: false,
      },
    },

    isDonator: { type: Boolean, default: false }, // is this user a donator?

    bansHistory: { type: [Ban], default: [] },
    loginHistory: { type: [LoginInfo], default: [] },

    // list all the donations of that user
    donations: {
      type: [
        {
          date: {
            type: Date,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

// Pre-save hook to set default tagline based on region if not provided
User.pre('save', function(next) {
  if (!this.summonerTagline || this.summonerTagline === '') {
    // Default taglines based on region
    const regionTaglines = {
      'NA': 'NA1',
      'EUW': 'EUW1',
      'EUNE': 'EUN1',
      'LAN': 'LAN1',
      'OCE': 'OCE1',
      'BR': 'BR1',
      'JP': 'JP1',
      'KR': 'KR',
      'TR': 'TR1',
      'RU': 'RU',
      'LAS': 'LAS1',
    };
    
    this.summonerTagline = regionTaglines[this.region] || `${this.region}1`;
  }
  next();
});

module.exports = mongoose.model('User', User, 'users');
