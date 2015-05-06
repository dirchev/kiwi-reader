// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define the schema for our user model
var collectionSchema = mongoose.Schema({
  title: String,
  files : [{
	  type: ObjectId,
	  ref: "File"
  }],
  books : [{
	  type: ObjectId,
	  ref: "Book"
  }],
  pages : [{
	  type: ObjectId,
	  ref: "Page"
  }],
  users : [{
    type: ObjectId,
    ref: "User"
  }]
});

module.exports = mongoose.model('Collection', collectionSchema);
