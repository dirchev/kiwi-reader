var fileStorageType = 'aws';
module.exports = {
  get: function(){
    return fileStorageType;
  },
  set: function(type){
    fileStorageType = type;
  }
};
