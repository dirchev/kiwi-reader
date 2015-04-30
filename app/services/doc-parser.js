var mammoth = require("../../edited_modules/mammoth");
var fs = require('fs')
module.exports = {
  docxToHTML: function(filePath){
    return mammoth.convertToHtml({path: filePath});
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
  }
};
