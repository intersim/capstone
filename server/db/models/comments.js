'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }

})

mongoose.model('Comment', schema);

