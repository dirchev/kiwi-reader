app.controller('ProfileCtrl', function($rootScope, $scope, $http){

  $scope.updateUser = function(user){
    var userData = {
      name : user.data.name,
      email : user.data.email
    };
    $http.post('/api/user', {user: userData}).success(function(data){
      if(data.success){
        toastr.success('Успешно обновихте данните');
      } else {
        toastr.error(data.message);
      }
    });
  };
});
