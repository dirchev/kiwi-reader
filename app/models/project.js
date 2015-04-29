// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define the schema for our user model
var projectSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  users: [{type: ObjectId, ref: 'User'}],
  files: [{type: ObjectId, ref: 'File'}],
  pages: [{type: ObjectId, ref: 'Pages'}],
  books: [{type: ObjectId, ref: 'Books'}]
});

module.exports = mongoose.model('Project', projectSchema);
