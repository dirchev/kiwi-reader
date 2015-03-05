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

module.exports = mongoose.model('Book', bookSchema);
