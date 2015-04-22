var awsService = require('../services/aws');
var fileStorageType = 'aws';
//var fileStorageType = 'local';
module.exports = function(app){
    if(fileStorageType === 'aws'){
      app.get('/uploads/*', function(req, res){
        var reqUrl = req.url.replace('/uploads/', '');
        awsService().getFile(reqUrl, req, res);
      });
    } else {
      app.use("/uploads", express.static(__dirname + '/uploads'));
    }
};
