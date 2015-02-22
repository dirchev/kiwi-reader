// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
// defina the schema for our user model
var bookSchema = mongoose.Schema({
  title: String,
  users: [{
    _id: {type: ObjectId, ref: 'User'},
    position: Number
  }],
  opf: Object,
  anotations: [{
    _id: String,
    title: String
  }]
});

module.exports = mongoose.model('Book', bookSchema);
