var s3 = require('s3');
var request = require('request');
var aws_config;
// check if you have env variables
if(typeof process.env.AWS_ACCESSKEY_ID === 'undefined'){
  // if not, try to reach ignored file
   aws_config = require('./aws_config');
} else {
  // if you do, use them
  aws_config = {
    accessKeyId : process.env.AWS_ACCESSKEY_ID,
    secretAccessKey : process.env.AWS_ACCESSKEY_SECRET
  };
}

var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: process.env.AWS_ACCESSKEY_ID,
    secretAccessKey: process.env.AWS_ACCESSKEY_SECRET
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
