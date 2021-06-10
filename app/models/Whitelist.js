'use strict';

const mongoose = require('mongoose');

let WhitelistSchema = new mongoose.Schema({
  token: { type: String, default: '' },
});

module.exports = mongoose.model('Whitelist', WhitelistSchema);
