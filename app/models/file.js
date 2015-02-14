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
    _id: String,
    user: {
      _id: {
        type: ObjectId,
        ref: 'User',
        required: true
      },
      name: String
    },
    title: {
      type :String,
      required: true
    },
    comments: [{
      user: {
        _id: {
          type: ObjectId,
          ref: 'User',
          required: true
        },
        name: String
      },
      content: {
        type: String,
        required: true
      }
    }]
  }]
});

module.exports = mongoose.model('File', fileSchema);
