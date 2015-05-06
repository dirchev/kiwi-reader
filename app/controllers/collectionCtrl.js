var Collection = require('../models/collection');
var File = require('../models/file');
var Page = require('../models/page');
var Book = require('../models/book');
var User = require('../models/user');

module.exports = { 
	// get all user's collections
	read: function(req, res){
		var user = req.user;
		Collection
			.find({'users' : user._id})	
			.select('title _id')
			.exec(function(err, collections){
				if(err){
					console.log("Error while getting collections" + err);
					res.json({success:false, message:"Грешка при търсенето на данните"});
				} else {
					res.json({success:true,collections:collections});
				}
			});
	},
	// get all info for collection
	readOne: function(req, res){
		var user = req.user;
		var collection_id = req.params.collection_id;
		Collection
			.findOne({_id:collection_id,'users':user._id})
			.populate('files', '_id title')
			.populate('books', '_id title')
			.populate('pages', '_id title image')
			.exec(function(err, collection){
				if(err){
					console.log("Error while getting collection" + err);
					res.json({success:false, message:"Грешка при взимането на данните"});
				} else if(!collection){
					res.json({success:false, message:"Колекцията не беше намерена"});
				} else {
					res.json({success:true, collection:collection});
				}
			});
	},
	// creates new collection
	create: function(req, res){
		var user = req.user;
		var title = req.body.title;
		var collection = new Collection();
		collection.users = [user._id];
		collection.title = title;
		collection.save(function(err, collection){
			if(err){
				console.log("Error while saving collection" + err);
				res.json({success:false, message:"Грешка при създаването на колекцията"});
			} else {
				res.json({success:false, collection:collection});
			}
		});
	},
	// rename collection
	rename: function(req, res){
		var user = req.user;
		var collection_id = req.params.collection_id;
		var title = req.body.title;
		Collection.update(
			{_id:collection_id, 'users':user._id},
			{title:title},
			{},
			function(err){
				if(err){
					console.log("Error while upadting collection" + err);
					res.json({success:false, message:"Грешка при преименуването на колекцията"});
				} else {
					res.json({success:false});
				}
			}
		);
	},
	// deletes collection
	delete: function(req, res){
		var user = req.user;
		var collection_id = req.params.collection_id;
		Collection.remove({_id : collection_id, "users":user._id}, function(err){
			if(err){
				console.log("Error while deleting collection" + err);
				res.json({success:false, message:"Грешка при изтриването на колекцията"});
			} else {
				res.json({success:false});
			}
		});
	},
	// adds thing to collection
	add: function(req, res){
		var user = req.user;
		var collection_id = req.body.collection_id;
		var thing = req.body.thing;
		checkIfThingExists(user._id, thing, function(exists){
			if(exists){
			 addThingToCollection(collection_id, user._id, thing, function(err, collection){
				if(err){
					res.json({success:false,message:"Грешка при добавянето на елемента към колекцията."});
				} else {
					//get collection
					Collection
						.findOne({_id:collection_id,'users':user._id})
						.populate('files', '_id title')
						.populate('books', '_id title')
						.populate('pages', '_id title image')
						.exec(function(err, collection){
							if(err){
								console.log("Error while getting collection" + err);
								res.json({success:false, message:"Грешка при взимането на данните"});
							} else if(!collection){
								res.json({success:false, message:"Колекцията не беше намерена"});
							} else {
								res.json({success:true, collection:collection});
							}
						});
				}
			 });
			} else {
				// thing do not exists
				res.json({success:false, message:"Елементът, който искате да добавите не е намерен."});
			}
		});
	}
	// TODO remove page
	// TODO remove book
	// TODO remove file
};

// checks if file, page or book exists
var checkIfThingExists = function (user_id, thing, callback){
	if(thing.type === 'file'){
		File
			.findOne(_id:thing.id, users: user_id)
			.select('_id') // for minimum data transfer
			.exec(function(err, file){
				if(err || !file){
					callback(false);
				} else {
					callback(true);
				}
			});
	} else if (thing.type === 'book'){
		Book
			.findOne({_id:thing.id, 'users.user': user_id})
			.select('_id') // for minimum data transfer
			.exec(function(err, book){
				if(err || !book){
					callback(false);
				} else {
					callback(true);
				}
			})
	} else if (thing.type === 'page'){
		Page
			.findOne({_id:thing.id, users: user_id})
			.select('_id') // for minimum data transfer
			.exec(function(err, page){
				if(err || !page){
					callback(false);
				} else {
					callback(true);
				}
			});
	} else {
		callback(false);
	}
};

// adds file, book or page to collection
var addThingToCollection = function(collection_id, user_id, thing, callback){
	Collection
	.findOne({_id: collection_id, users: user_id})
	.exec(function(err, collection){
		if(err || !collection){
			callback(err);
		} else {
			collection[thing.type+'s'].push(thing.id);
			collection.save(function(err){
				if(err){
					console.log('Error while saving collection: ' + err);
					callback(err);
				} else {
					callback();
				}
			});
		}
	});
};