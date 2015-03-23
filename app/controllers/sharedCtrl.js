var File = require('../models/file');

module.exports = function(){
  return {
    file: function(req, res){
      var file_id = req.params.file_id;
      File.findOne({_id: file_id, public: true}, function(err,file){
        if(err){
          console.log(err);
          // send some kind of 404
        } else if(!file){
          // send some kind of 404
        } else {
          res.render('file.ejs', { content: file.content });
        }
      });
    } // end of file function
  }; // end of return object
}; // end of module.exports
