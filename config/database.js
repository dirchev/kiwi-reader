// config/database.js
var url = proccess.env.MONGODB_URL || 'mongodb://localhost:1313'
module.exports = {
  'url' : url
};
