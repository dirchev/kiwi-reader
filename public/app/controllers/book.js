app.controller('BookCtrl', function($scope, $http, $stateParams, $state, Book, $rootScope){
  var book_id = $stateParams.id;
  var userIndex;
  var scrolled = 0;
  $scope.scrolled = 0;

  // set arrow keys rules
  $(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
        case 38: // up
          $scope.previousPage();
          break;
        case 39: // right
        case 40: // down
          $scope.nextPage();
          break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
  });

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
    $scope.scrolled = 0;
    $(".page-preview").animate({
        scrollTop:  0
    });
    renderPage(pageId);
  }

  var renderPage = function(id){
    $http.get($scope.book.opf['manifest'][id].href).success(function(data){
      $scope.page = data.replace(/src="/g, 'src="/uploads/extracted/' + book_id + '/' + $scope.book.opf.contentPath + '/');
      $scope.page = $scope.page.replace(/href="/g, 'href="/uploads/extracted/' + book_id + '/' + $scope.book.opf.contentPath + '/');
      $scope.page = $scope.page.replace(/<style/g, '<div style="display:none">');
      $scope.page = $scope.page.replace(/<\/style>/g, '</div>');
      $scope.page = $scope.page.replace(/<link/g, '<aaaa');
    });
  }

  $scope.nextPage = function(){
    if(!scrolledToBottom()){
      // if he does not, scroll down
      $scope.scrolled = $scope.scrolled + 300;
      $(".page-preview").animate({
          scrollTop:  $scope.scrolled
      });
    } else {
      // else, render next page
      $scope.updatePosition(1);
    }
  }

  $scope.previousPage = function(){
    // check if user got to the top of page
    // if he does not, scroll up
    // else, render prev page
    $scope.updatePosition(-1);
  }

  var scrolledToBottom = function(){
    var elem = $('.page-preview');
    return elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight()
  }

});
