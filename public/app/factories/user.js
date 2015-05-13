app.factory('User', function($http, $rootScope){
  return {
    get: function(){
      return $http.get('/api/user');
    },
    update: function(){
      $http.get('/api/user').success(function(data){
        if(data.success){
          $rootScope.user = data.user;
        } else {
          toastr.error(data.message);
        }
      });
    },
    getLastFiles: function(){
      return $http.get('/api/user/' + $rootScope.user._id + '/lastFiles');
    },
    signup: function(user){
      return $http.post('/api/user/new', {user:user});
    }
  };
});
