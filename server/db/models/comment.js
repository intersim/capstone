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
    kind: String,
    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'target.kind'
    }
  }
})

mongoose.model('Comment', CommentSchema);


