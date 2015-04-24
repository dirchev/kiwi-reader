app.factory('Bookmark', function($http, User){
  return {
    get: function(){
      return $http.get('/api/bookmark');
    },
    add: function(bookmark){
      return $http.post('/api/bookmark', {bookmark: bookmark});
    },
    delete: function(bookmark_index){
      return $http.delete('/api/bookmark/' + bookmark_index);
    }
  };
});
