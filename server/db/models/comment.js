'use strict';

var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mix',
    required: true
  }
})

mongoose.model('Comment', CommentSchema);


