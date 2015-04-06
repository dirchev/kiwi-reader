var path = require('path');
var fs = require('fs');
var unzip = require('unzip');
var fstream = require('fstream');
var xml_json = require('xml2js');
var awsService = require('./aws');

var folderPath;
var bookId;
var contentPath;

module.exports = {
  unzip: function(filePath, outputPath, cb){
    // create directory, where file will be stored
    fs.mkdirSync(outputPath);
    // extract the file and save the extracted folder to outputPath
    var readStream = fs.createReadStream(filePath);
    var writeStream = fstream.Writer(outputPath);
    readStream
      .pipe(unzip.Parse())
      .pipe(writeStream)
      .on('close', function(){
        var localDir = outputPath;
        var arr = localDir.split('/');
        var remoteDir = arr[arr.length-2] + '/' + arr[arr.length-1];
        console.log(remoteDir);
        awsService().uploadDir(localDir, remoteDir, cb);
      });
  },
  getContent : function(fp, id, cb){
    folderPath = fp;
    bookId = id;
    // get opf file from container
    var opf = getOpf(folderPath, function(opf){
      // parse opf file contents in array
      parseOpf(opf, function(result){
        cb(result);
      });
    });
  }
};

var getOpf = function(folderPath, cb){
  // read container.xml file
  var container = fs.readFileSync(path.join(folderPath + '/META-INF/container.xml'), 'utf8');
  // convert xml to json
  xml_json.parseString(container, function(err, data){
    container_content = data;
    var rootFilePath = container_content.container.rootfiles[0].rootfile[0].$['full-path'];
    getContentPath(rootFilePath);
    rootFilePath = folderPath + '/' + rootFilePath;
    var opf_content = fs.readFileSync(rootFilePath, 'utf8');
    cb(opf_content);
  });
};

var getContentPath = function(rootFilePath){
  var a = rootFilePath.replace('content.opf', '');
  if(a.trim() === ''){
    contentPath =  '.';
    return;
  } else {
    console.log(a);
    a = a.split('/');
    if(typeof a[0] === 'undefined'){
      contentPath =  '.';
      return;
    } else {
      contentPath =  a[0];
      return;
    }
  }
};

var parseOpf = function(opfFile, cb){
  var opf = {
    metadata: {},
    manifest: {},
    spines: []
  };
  getContents(opfFile, function(metadata, manifest, spines){
    opf.metadata = metadata;
    opf.manifest = manifest;
    opf.spines = spines;
    opf.contentPath = contentPath;
    cb(opf);
  });
};

var getContents = function(opfFile, cb){
  xml_json.parseString(opfFile, function(err, data){
    // GETTING METADATA ============================
    var metadata = {};
    var metadata_content = data.package.metadata;
    for (var i in metadata_content[0]){
      if(i !== '$' & i !== 'meta'){
        metadata[i] = metadata_content[0][i][0]._;
      }
    }
    // GETTING MANIFEST ============================
    var manifest = {};
    var manifest_content = data.package.manifest[0].item;
    for (i in manifest_content){
      var obj = manifest_content[i].$;
      var id = obj.id.replace(/\./g, 'U+FF0E');
      manifest[id] = {
        'media-type' : obj['media-type'],
        'href'       : '/uploads/extracted/' + bookId + '/' + contentPath + '/' + obj.href
      };
    }
    // GETTING SPINE ===============================
    var spine = [];
    var spine_content = data.package.spine[0].itemref;
    for(i in spine_content){
      spine.push(spine_content[i].$.idref);
    }
    cb(metadata, manifest, spine);
  });
};
