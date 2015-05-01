// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var textSearch = require('mongoose-text-search');

// define the schema for our user model
var bookSchema = mongoose.Schema({
  title: String,
  users: [{
    user: {type: ObjectId, ref: 'User'},
    position: {
      type: Number,
      default: null
    }
  }],
  opf: Object,
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

bookSchema.plugin(textSearch);
bookSchema.index({ title: "text"});
module.exports = mongoose.model('Book', bookSchema);
