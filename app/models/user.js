var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

// defina the schema for our user model
var userSchema = mongoose.Schema({
  local            :{
        email        : String,
        password     : String
  },
  facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    data : {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: false
      },
      photo: String
    },
    bookmarks: [{
      datetime: {
        type: Date,
        default: Date.now
      },
      content: {
        type: String,
        required: true
      }
    }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastFiles : [{ type:Schema.Types.ObjectId, ref: 'File'}],
    lastPages : [{ type:Schema.Types.ObjectId, ref: 'Page'}],
    lastBooks : [{ type:Schema.Types.ObjectId, ref: 'Book'}],
    lastCollections : [{ type:Schema.Types.ObjectId, ref: 'Collection'}]
});

// methods ===========================
//generating a hash
userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
