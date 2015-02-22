app.controller('BookCtrl', function($scope, $http, $stateParams, $state, Book, $rootScope){
  var book_id = $stateParams.id;
  var userIndex;

  Book.getOne(book_id).success(function(data){
    if(!data.success){
      toastr.error(data.message);
      $state.go('books');
    } else {
      $scope.book = data.book;
      for(i in $scope.book.users){
        if($scope.book.users[i]._id === $rootScope.user._id){
          userIndex = i;
        }
      }
      var pageId = $scope.book.opf.spines[$scope.book.users[userIndex].position];
      renderPage(pageId);
    }
  });

  $scope.updatePosition = function(a) {
    if(a === -1){
      $scope.book.users[userIndex].position -= 1;
    } else {
      $scope.book.users[userIndex].position += 1;
    }
    var position = $scope.book.users[userIndex].position;
    var pageId = $scope.book.opf.spines[position];
    renderPage(pageId);
  }

  var renderPage = function(id){
    $http.get($scope.book.opf['manifest'][id].href).success(function(data){
      $scope.page = data.replace(/src="/g, 'src="/uploads/extracted/' + book_id + '/' + $scope.book.opf.contentPath + '/');
      $scope.page = $scope.page.replace(/href="/g, 'href="/uploads/extracted/' + book_id + '/' + $scope.book.opf.contentPath + '/');
    })
  }

});
