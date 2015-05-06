app.controller('CollectionCtrl', function($scope, $stateParams, $state, Collection, Search, File){
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
	
	//get user files
	$scope.addFileModal = function(){
		$('#addFileModal').modal('show');
		File.get().success(function(data){
			$scope.files = data;
		});
	}
	//get user books
	//get user pages
	
	getCollectionData();
});