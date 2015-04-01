var s3 = require('s3');
var request = require('request');

var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: "AKIAJQU3MHCTULZMUZKQ",
    secretAccessKey: "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"
  },
});
module.exports = function(){
  return {
    uploadDir: function(localDir, remoteDir, cb){
      var params = {
        localDir: localDir,
        deleteRemoved: true,
        s3Params: {
          Bucket  : "kiwi-reader",
          Prefix  : remoteDir,
          ACL     : "public-read"
        },
      };
      var uploader = client.uploadDir(params);
      uploader.on('error', function(err) {
        cb(err.stack);
      });
      uploader.on('end', function() {
        cb(null);
      });
    },
    getFile: function(filePath, req, res){
      var url = s3.getPublicUrlHttp('kiwi-reader', filePath);
      var x = request(url);
       req.pipe(x);
       x.pipe(res);
    },
    deleteDir: function(remoteDir, cb){
      var s3Params =  {
        Bucket  : "kiwi-reader",
        Prefix  : remoteDir
      };
      var deleter = client.deleteDir(s3Params);
      deleter.on('error', function(err){
        cb(err);
      });
      deleter.on('end', function(){
        cb(null);
      });
    }
  };
};
