app.controller('BookCtrl', function($scope, $http, $stateParams, $state, Book, $rootScope){
  var book_id = $stateParams.id;
  var userIndex;
  var scrolled = 0;
  $scope.scrolled = 0;
  $scope.selectedText = '';

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
      for(var i in $scope.book.users){
        if($scope.book.users[i]._id === $rootScope.user._id){
          userIndex = i;
        }
      }
      var tocFileHref = $scope.book.opf.manifest.toc || $scope.book.opf.manifest.ncx;
      tocFileHref = tocFileHref.href;
      $http.get(tocFileHref).success(function(data){
        $scope.toc = data;
        var r = /[^\/]*$/;
        var tocFolder = tocFileHref.replace(r, ''); // '/this/is/a/folder/'
        $scope.toc = $scope.toc.replace(/href="/g, 'link-location="'+tocFolder);
      });
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
    updateUserPosition();
    var position = $scope.book.users[userIndex].position;
    var pageId = $scope.book.opf.spines[position];
    $scope.scrolled = 0;
    $("#page-preview").scrollTop(0);
    renderPage(pageId);
  };


  var renderPage = function(id){
    var pageHref = $scope.book.opf['manifest'][id].href;
    var r = /[^\/]*$/;
    var pageFolder = pageHref.replace(r, ''); // '/this/is/a/folder/'
    $http.get(pageHref).success(function(data){
      $scope.page = data.replace(/src="/g, 'style="max-width:100%" src="'+pageFolder);
      $scope.page = $scope.page.replace(/href="http/g, 'link-location="http');
      $scope.page = $scope.page.replace(/href="https/g, 'link-location="https');
      $scope.page = $scope.page.replace(/href="/g, 'link-location="'+pageFolder);
      $scope.page = $scope.page.replace(/<style/g, '<div style="display:none">');
      $scope.page = $scope.page.replace(/<\/style>/g, '</div>');
      $scope.page = $scope.page.replace(/<link/g, '<aaaa');
    });
  };

  $scope.renderPageLink = function(link){
    if(validURL(link)) {
      window.open(link, '_tab');
      return;
    } else {
      for(var i in $scope.book.opf.manifest){
        if($scope.book.opf.manifest[i].href === link){
          for(var j = 0; j<$scope.book.opf.spines.length; j++){
            if($scope.book.opf.spines[j] === i){
              $scope.book.users[userIndex].position = j;
              var pageId = $scope.book.opf.spines[j];
              updateUserPosition();
              break;
            }
          }
          break;
        }
      }
      var pageHref = link;
      var r = /[^\/]*$/;
      var pageFolder = link.replace(r, ''); // removes filename and returns folder
      $http.get(pageHref).success(function(data){
        $scope.page = data.replace(/src="/g, 'src="'+pageFolder);
        $scope.page = $scope.page.replace(/href="http/g, 'link-location="http');
        $scope.page = $scope.page.replace(/href="https/g, 'link-location="https');
        $scope.page = $scope.page.replace(/href="/g, 'link-location="'+pageFolder);
        $scope.page = $scope.page.replace(/<style/g, '<div style="display:none">');
        $scope.page = $scope.page.replace(/<\/style>/g, '</div>');
        $scope.page = $scope.page.replace(/<link/g, '<aaaa');
      });
    }
  };

  $scope.nextPage = function(){
    if(!scrolledToBottom()){
      // if he does not, scroll down
      $scope.scrolled = $("#page-preview").scrollTop() + ($("#page-preview").height() - 200);
      $("#page-preview").scrollTop($scope.scrolled);
    } else {
      // else, render next page
      $scope.updatePosition(1);
    }
  };

  $scope.previousPage = function(){
    if(!scrolledToTop()){
      // if he does not, scroll up
      $scope.scrolled = $("#page-preview").scrollTop() - ($("#page-preview").height() - 200);
      $("#page-preview").scrollTop($scope.scrolled);
    } else {
      // else, render next page
      $scope.updatePosition(-1);
    }
  };

  var scrolledToBottom = function(){
    var elem = $('#page-preview');
    return elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight();
  };

  var scrolledToTop = function(){
    var elem = $('#page-preview');
    return elem.scrollTop() == 0;
  };

  var updateUserPosition = function(){
    var data = {
      userIndex : userIndex,
      position: $scope.book.users[userIndex].position
    };
    Book.updateUserPosition(book_id, data).success(function(data){
      if(data.success){
        //toastr.success('Успешно запазена позиция.');
      } else {
        toastr.error(data.message);
      }
    });
  };

  var validURL= function (str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?','i'); // query string
    if(!pattern.test(str)) {
      return false;
    } else {
      return true;
    }
  };

});
