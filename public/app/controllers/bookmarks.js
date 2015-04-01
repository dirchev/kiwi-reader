app.controller('BookmarksCtrl', function($scope, $rootScope, Bookmark){
  var getBookmarks = function(){
    Bookmark.get().success(function(data){
      if(data.success){
        $scope.bookmarks = data.bookmarks;
      } else {
        toastr.error(data.message);
      }
    });

  };
  $scope.deleteBookmark = function(bookmark_index){
    Bookmark.delete(bookmark_index).success(function(data){
      if(data.success){
        getBookmarks();
        toastr.success('Цитатът е изтрит!');
      } else {
        toastr.error(data.message);
      }
    });
  };
  getBookmarks();
});
