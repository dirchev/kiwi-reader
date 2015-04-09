app.factory('Friend', function($http){
  return {
    add: function(friend_email){
      return $http.post('/api/friend', {friend_email: friend_email});
    },
    rename: function(friend_index, friend_name){
      return $http.post('/api/friend/'+friend_index+'/rename', {friend_name: friend_name});
    },
    remove: function(friend_index){
      return $http.delete('/api/friend/' + friend_index);
    }
  };
});
