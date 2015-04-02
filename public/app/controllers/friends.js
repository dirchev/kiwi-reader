app.controller('FriendsCtrl', function($scope, Friend){

  // get all friends
  var getFriends = function(){
    Friend.get().success(function(data){
      if(data.success){
        $scope.friends = data.friends;
      } else {
        toastr.error(data.message);
      }
    });
  };

  // add user to friends list
  $scope.addFriend = function(friend_email){
    Friend.add(friend_email).success(function(data){
      if(data.success){
        getFriends();
        toastr.success('Успешно добавихте приятел.');
        $('#newFriendModal').modal('hide');
      } else {
        toastr.error(data.message);
      }
    });
  };

  // remove user from friends list
  $scope.removeFriend = function(friend_index){
    Friend.remove(friend_index).success(function(data){
      if(data.success){
        getFriends();
        toastr.success('Успешно премахнахте приятел.');
      } else {
        toastr.error(data.message);
      }
    });
  };

  // initial function
  getFriends();
});
