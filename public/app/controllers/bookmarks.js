app.controller('BookmarksCtrl', function($scope, $rootScope, Bookmark, User){
  $scope.deleteBookmark = function(bookmark_index){
    Bookmark.delete(bookmark_index).success(function(data){
      if(data.success){
        User.update();
        toastr.success('Цитатът е изтрит успешно!');
      } else {
        toastr.error(data.message);
      }
    });
  };
});
