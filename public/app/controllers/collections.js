/* global toastr */
app.controller('CollectionsCtrl', function($scope, Collection){
	var getCollections = function(){
		Collection.get().success(function(data){
			if(data.success){
				$scope.collections = data.collections;
			} else {
				toastr.error(data.message);
			}
		});	
	};
	
	getCollections();
		
	$scope.create = function(title){
		Collection.create(title).success(function(data){
			if(data.success){
				toastr.success('Успешно създадохте колекция.');
				getCollections();
			} else {
				toastr.error(data.message);
			}
		});	
	};
	
	$scope.rename = function(collection_id, title){
		Collection.rename(collection_id, title).success(function(data){
			if(data.success){
				toastr.success('Успешно преименувахте колекцията.');
				getCollections();
			} else {
				toastr.error(data.message);
			}
		});
	};
	
	$scope.remove = function(collection_id){
		Collection.remove(collection_id).success(function(data){
			if(data.success){
				toastr.success('Успешно премахнахте колекция.');
				getCollections();
			} else {
				toastr.error(data.message);
			}
		});
	};
});