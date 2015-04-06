app.controller('ProfileCtrl', function($rootScope, $scope, $http){

  // TODO change password
  
  $scope.updateUser = function(user){
    $http.post('/api/user', {user: user}).success(function(data){
      if(data.success){
        toastr.success('Успешно обновихте данните');
      } else {
        toastr.error(data.message);
      }
    });
  };
});
