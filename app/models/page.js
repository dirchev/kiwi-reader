// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var UserSchema = require('./user');
var textSearch = require('mongoose-text-search');

// define the schema for our user model
var pageSchema = mongoose.Schema({
  title: {
    type: String,
    default: 'Неозаглавена страница',
  },
  content: {
    type: String,
    required: true
  },
  link:{
    type:String,
    required: true
  },
  image: {
      type: String,
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

pageSchema.plugin(textSearch);
pageSchema.index({ title: "text", content: "text"});

module.exports = mongoose.model('Page', pageSchema);
