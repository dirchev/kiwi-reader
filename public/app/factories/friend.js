app.factory('Friend', function($http){
  return {
    get: function(){
      return $http.get('/api/friend');
    },
    add: function(friend_email){
      return $http.post('/api/friend', {friend_email: friend_email});
    },
    rename: function(friend){
      return $http.post('/api/friend/'+friend.index+'/rename', {friend_name: friend.name});
    },
    remove: function(friend_index){
      return $http.delete('/api/friend/' + friend_index);
    }
  };
});
