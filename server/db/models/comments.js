'use strict';
var mongoose = require('mongoose');
var context = require('mongoose-context-ref');

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
  target: [mongoose.Schema.ObjectId]

})

schema.plugin(context);

mongoose.model('Comment', schema);

/*
the plugin adds fields:
{
  context_id: ObjectId,
  context_type: String
}

to our model.

when we QUUeerYYY for a comment we must do something like this though: 

Comment.find({
  context_type: 'User'/'Loop'/'Composition',
  context_id: '532280fcfed4c6f00d0dce63'(its regular id)
})

ALTERNATIVELY, 

Comment.withContext({
  user/loop/composition: '532280fcfed4c6f00d0dce63'
});

withContext is a static mongoose-context-ref adds to our schema

*/
