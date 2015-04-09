app.controller('FriendsCtrl', function($scope, $rootScope, Friend, User){
  // add user to friends list
  $scope.addFriend = function(friend_email){
    Friend.add(friend_email).success(function(data){
      if(data.success){
        toastr.success('Успешно добавихте приятел.');
        User.update();
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
        User.update();
        toastr.success('Успешно премахнахте приятел.');
      } else {
        toastr.error(data.message);
      }
    });
  };

  // rename friend
  $scope.renameFriend = function(friend_index, friend_name){
    Friend.rename(friend_index, friend_name).success(function(data){
      if(data.success){
        toastr.success('Успешно преименувахте приятел.');
        User.update();
      } else {
        toasrt.success(data.message);
      }
    });
  };
});
