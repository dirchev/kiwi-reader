// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var UserSchema = require('./user');

// define the schema for our user model
var fileSchema = mongoose.Schema({
  title: {
      type: String,
      default: 'Неозаглвен файл',
  },
  content: {
      type: String,
      default: '',
  },
  public: {
    type: Boolean,
    default: false,
    required: true
  },
  users: [{type: ObjectId, ref: 'User'}],
  anotations: [{
    _id: String,
    user: {type: ObjectId, ref: 'User'},
    title: {
      type :String,
      required: true
    },
    comments: [{
      user: {type: ObjectId, ref: 'User'},
      content: {
        type: String,
        required: true
      }
    }]
  }]
});

module.exports = mongoose.model('File', fileSchema);
