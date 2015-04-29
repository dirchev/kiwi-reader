app.factory('User', function($http, $rootScope){
  return {
    get: function(){
      return $http.get('/api/user');
    },
    update: function(){
      $http.get('/api/user').success(function(data){
        $rootScope.user = data;
      });
    },
    getLastFiles: function(){
      return $http.get('/api/user/' + $rootScope.user._id + '/lastFiles');
    }
  };
});
