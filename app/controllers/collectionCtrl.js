var Collection = require('../models/collection');

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
	}
	// TODO add file
	// TODO add page
	// TODO add book
	// TODO remove page
	// TODO remove book
	// TODO remove file
};