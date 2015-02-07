// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
// defina the schema for our user model
var bookSchema = mongoose.Schema({
  title: String,
  file: String,
  users: [{type: ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Book', bookSchema);
