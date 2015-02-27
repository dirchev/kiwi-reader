var mammoth = require("mammoth");
module.exports = {
  docxToHTML: function(filePath){
    return mammoth.convertToHtml({path: filePath})
  }
}
