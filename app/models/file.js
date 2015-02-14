// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// defina the schema for our user model
var fileSchema = mongoose.Schema({
  title: {
      type: String,
      default: 'Неозаглвен файл',
  },
  content: {
      type: String,
      default: '',
  },
  users: [{type: ObjectId, ref: 'User'}],
  anotations: [{
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type :String,
      required: true
    },
    comments: [{
      user: {
        type: ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      }
    }]
  }]
});

module.exports = mongoose.model('File', fileSchema);
