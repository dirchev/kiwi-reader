app.controller('BookCtrl', function($scope, $http, $stateParams, $state){

  var book_id = $stateParams.id;
  
  Book.getOne(book_id).success(function(data){
    if(!data.success){
      toastr.error(data.message);
      $state.go('books');
    } else {
      $scope.book = data.book;
    }
  });

});
