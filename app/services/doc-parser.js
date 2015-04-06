var mammoth = require("../../edited_modules/mammoth");
module.exports = {
  docxToHTML: function(filePath){
    return mammoth.convertToHtml({path: filePath});
  }
};
