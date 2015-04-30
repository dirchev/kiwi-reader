var mammoth = require("../../edited_modules/mammoth");
var fs = require('fs');
var request = require('request');

var self = module.exports = {
  docxToHTML: function(filePath, callback){
    mammoth.convertToHtml({path: filePath}).then(function(result){
      callback(null, result.value);
    });
  },
  txtToHTML: function(filePath, callback){
    fs.readFile(filePath, 'utf8', function(err, fileContent){
      if(err){
        console.log('Error while getting file from file system: ' + err);
        callback('Грешка при запазването на файла.');
      } else {
        fileContent = fileContent.replace(/\r?\n/g, '<br />');
        fileContent = fileContent.replace(/\r?\t/g, '&nbsp;&nbsp');
        callback(err, fileContent);
      }
    }); 
  },
  dropboxToHTML : function(file, callback){
    // download and save the file
    var filePath = __dirname + '/../../uploads/files/' + file.name;
    var r = request(file.link);
    r.on('response', function(response){
      response
        .pipe(fs.createWriteStream(filePath))
        .on('close', function(){
          var extention = getFileExtention(file.name);
          if(extention === 'txt'){
            self.txtToHTML(filePath, callback);
          } else if (extention === 'docx'){
            self.docxToHTML(filePath, callback);
          } else {
            callback('Този файл не се поддържа.');
          }
        });
    });
   
  }
};

var getFileExtention = function(filename){
  return filename.split('.').pop();
}
