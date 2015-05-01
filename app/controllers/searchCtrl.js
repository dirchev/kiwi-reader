var async = require('async');

var User = require('../models/user');
var Page = require('../models/page');
var Book = require('../models/book');
var File = require('../models/file');

module.exports = {
	all : function(req, res) {
		var search = req.params.search;
		async.parallel({
			files: searchInFiles.bind(null, search)
		}, function(err, result){
			if(err){
				console.log("Error while searching: " + err);
				res.json({success:false, message: "Грешка при намирането на резултатите."});
			} else {
				res.json({success:true, result:result});
			}
		})
	}
};

var searchInFiles = function(search, callback){
	File.textSearch(search, {project:'_id title'},function(err, result){
		callback(err, result);
	});
};

