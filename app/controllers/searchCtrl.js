var async = require('async');

var User = require('../models/user');
var Page = require('../models/page');
var Book = require('../models/book');
var File = require('../models/file');

module.exports = {
	all : function(req, res) {
		var search = req.params.search;
		var user_id = req.user._id;
		async.parallel({
			files: searchInFiles.bind(null, search, user_id),
			pages: searchInPages.bind(null, search, user_id),
			books: searchInBooks.bind(null, search, user_id)
		}, function(err, result){
			if(err){
				console.log("Error while searching: " + err);
				res.json({success:false, message: "Грешка при намирането на резултатите."});
			} else {
				res.json({success:true, result:result});
			}
		});
	}
};

var searchInFiles = function(search, user_id, callback){
	File.textSearch(search, {project:'_id title', filter: { users : user_id}},function(err, result){
		callback(err, result);
	});
};

var searchInPages = function(search, user_id, callback){
	Page.textSearch(search, {project:'_id title', filter: { users : user_id}},function(err, result){
		callback(err, result);
	});
};

var searchInBooks = function(search, user_id, callback){
	Book.textSearch(search, {project:'_id title', filter: { 'users.user' : user_id}},function(err, result){
		callback(err, result);
	});
};

