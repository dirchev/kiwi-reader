app.factory('File', function($http){
  return {
    get: function(){
      return $http.get('/api/file/');
    },
    getOne: function(id){
      return $http.get('/api/file/' + id);
    },
    create: function(){
      return $http.post('/api/file/');
    },
    delete: function(id){
      return $http.delete('/api/file/' + id);
    },
    share: function(file_id, user_email){
      return $http.post('/api/file/' + file_id + '/share', {user_email:user_email});
    },
    getShared: function(file_id){
      return $http.get('/api/file/' + file_id + '/share');
    }
  }
})
