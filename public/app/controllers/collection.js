app.controller('CollectionCtrl', function($scope, $stateParams, $state, Collection, Search, File, Book, Page){
	var collection_id = $stateParams.collection_id;
	$scope.files = [];
	var getCollectionData = function(){
		Collection.getOne(collection_id).success(function(data){
			if(data.success){
				$scope.collection = data.collection;
			} else {
				toastr.error(data.message);
				$state.go('collections');
			}
		});
	};
	
	$scope.addFileModal = function(){
		$('#addFileModal').modal('show');
		File.get().success(function(data){
			$scope.files = data;
		});
	};
	
	$scope.addBookModal = function(){
		$('#addBookModal').modal('show');
		Book.get().success(function(data){
			$scope.books = data.books;
		});
	};
	
	$scope.addPageModal = function(){
		$('#addPageModal').modal('show');
		Page.get().success(function(data){
			$scope.pages = data.pages;
		});
	};
	
	$scope.add = function(type, id){
		var data = {
			collection_id : collection_id,
			thing: {
				type:type,
				id:id
			}
		};
		
		Collection.addThing(data).success(function(data){
			if(data.success){
				toastr.success('Елементът беше добавен.');
			} else {
				toastr.error(data.message);
			}
			$('.modal').modal('hide');
			getCollectionData();
		});	
	};
	
	$scope.remove = function(type, id){
		var data = {
			collection_id : collection_id,
			thing:{
				type:type,
				id:id
			}
		};
		Collection.removeThing(data).success(function(data){
			if(data.success){
				toastr.success('Елементът беше премахнат.');
			} else {
				toastr.error(data.message);
			}
			getCollectionData();
		});
	};
	
	getCollectionData();
});