app.factory('Book', function($http){
  return {
    get: function(){
      return $http.get('/api/book');
    },
    getOne: function(id){
      return $http.get('/api/book/' + id);
    },
    create: function(){
      return $http.post('/api/book')
    },
    delete: function(id){
      return $http.delete('/api/book/' + id);
    }
  }
})
