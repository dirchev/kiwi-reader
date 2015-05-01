app.controller('HomeCtrl', function($rootScope, User, $scope, Search){
  // update user to get last visited files
  User.update();
  
  $scope.search = function(searchPhrase){
    Search.all(searchPhrase).success(function(data){
      if(!data.success){
        toastr.error(data.message);
      } else {
        $scope.searchResult = data.result;
      }
    });
  };
});
