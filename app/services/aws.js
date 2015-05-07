var s3 = require('s3');
var request = require('request');
var fileStorageType = require('../../config/file_storage');
var aws_config;
// check if you have env variables
if(typeof process.env.AWS_ACCESSKEY_ID !== 'undefined'){
  // if you do, use them
  aws_config = {
    accessKeyId : process.env.AWS_ACCESSKEY_ID,
    secretAccessKey : process.env.AWS_ACCESSKEY_SECRET
  };
} else {
  // if not, try to reach ignored file
   try{
     aws_config = require('./aws_config');
   } catch(e){
     console.log('\n***\nNo AWS S3 keys found. Changing file storage to local. (files are saved in uploads folder).\n***\n');
     fileStorageType.set('local');
   }
}

if(fileStorageType.get() === 'aws'){
  var client = s3.createClient({
    s3Options: {
      accessKeyId: aws_config.accessKeyId,
      secretAccessKey: aws_config.secretAccessKey
    },
  });
}
module.exports = function(){
  return {
    uploadDir: function(localDir, remoteDir, cb){
      console.log(remoteDir);
      var params = {
        localDir: localDir,
        deleteRemoved: true,
        s3Params: {
          Bucket  : "kiwireader",
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
      var url = s3.getPublicUrlHttp('kiwireader', filePath);
      var x = request(url);
       req.pipe(x);
       x.pipe(res);
    },
    deleteDir: function(remoteDir, cb){
      var s3Params =  {
        Bucket  : "kiwireader",
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
