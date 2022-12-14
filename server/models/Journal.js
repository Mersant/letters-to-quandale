const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const journalSchema = new Schema({
  journalText: {
    type: String,
    required: 'You can not upload an empty journal entry',
    minlength: 1,
    trim: true,
  },
  image:{
    type:String,
    trim:true,
    required:false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => dateFormat(timestamp),
  },
});

const Journal = model('Journal', journalSchema);

module.exports = Journal;
