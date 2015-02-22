var awsService = require('../aws-service');

module.exports = function(app){
    app.get('/uploads/*', function(req, res){
      var reqUrl = req.url.replace('/uploads/', '');
      awsService().getFile(reqUrl, req, res);
    })
}
