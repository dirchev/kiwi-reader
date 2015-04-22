var awsService = require('../services/aws');
var express = require('express');
var path = require('path');
var fileStorageType = require('../../config/file_storage');

module.exports = function(app){
    app.get('/uploads/*', function(req, res){
      if(fileStorageType.get() === 'aws'){
        var reqUrl = req.url.replace('/uploads/', '');
        awsService().getFile(reqUrl, req, res);
      } else {
        res.sendfile(req.url, {root:path.join(__dirname,'../../')});
      }
    });
};
