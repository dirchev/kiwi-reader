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
    },
    share: function(book_id, user_email){
      return $http.post('/api/book/' + book_id + '/share', {user_email:user_email});
    },
    getShared: function(book_id){
      return $http.get('/api/book/' + book_id + '/share');
    }
  }
})
