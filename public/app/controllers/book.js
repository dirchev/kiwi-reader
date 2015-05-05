/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/* global toastr */
app.controller('BookCtrl', function($scope, $http, $stateParams, $state, Book, $rootScope, Friend, $window, Bookmark, User, $timeout){
  var book_id = $stateParams.id;
  var userIndex;
  $scope.scrolled = 0;
  $scope.selectedText = '';
  $scope.sidePanel = 'none';
  $scope.chat = [];
  var socket = $window.io();


  $scope.addBookmark = function(){
    var bookmark = $scope.selectedText;
    Bookmark.add(bookmark).success(function(data){
      if(data.success){
        toastr.success('Цитатът е запазен успешно.');
        User.update();
        $scope.cancelAnotation();
      } else {
        toastr.error(data.message);
      }
    });
  };

  $scope.onTextSelect = function(){
    if($scope.selectedText.length >0){
      $('#selectionModal').modal('show');
    }
  };

  var setElementsHeight = function(){
    $scope.contentHeight = $(window).height() - 2*64 - 60;
    $('#contentWrapper').height($scope.contentHeight);
    $('#contentBox').height($scope.contentHeight);
    $('#chatBox').height($scope.contentHeight);
    $('#page-preview').height($scope.contentHeight);
    $('#prevPageBtn').height($scope.contentHeight);
    $('#nextPageBtn').height($scope.contentHeight);
  };
  $(window).resize(function(){
    setElementsHeight();
  });
  setElementsHeight();

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
      $state.go('app.books');
    } else {
      $scope.book = data.book;
      for(var i in $scope.book.users){
        if($scope.book.users[i].user._id === $rootScope.user._id){
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
        setElementsHeight();
      });
      var pageId = $scope.book.opf.spines[$scope.book.users[userIndex].position];
      renderPage(pageId);

      socket.emit('open:book', book_id);

      socket.on('book:update:chat', function(message){
        $scope.$apply(function(){
          $scope.chat.push(message);
          // TODO fix this quickfix
          $timeout(function(){
            $("#chatBox").scrollTop($scope.chat.length*66);
          }, 200);
        });
      });

    }
  });

  $scope.addChatMessage = function(message){
    var data = {
      book_id : book_id,
      message: {
        user : $rootScope.user.data.name,
        content : message
      }
    };
    socket.emit('book:add:chat', data);
    $scope.chat.push(data.message);
    $scope.chatMessage = '';
    // TODO fix this quickfix
    $timeout(function(){
      $("#chatBox").scrollTop($scope.chat.length*66);
    }, 200);
  };

  $scope.shareBook = function(user){
    Book.share(book_id, user).success(function(data){
        if(data.success){
          toastr.success('Успешно споделяне.');
        } else {
          toastr.error(data.message, 'Неуспешно споделяне.');
        }
      });
  };

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
    var pageHref = $scope.book.opf.manifest[id].href;
    var r = /[^\/]*$/;
    var pageFolder = pageHref.replace(r, ''); // '/this/is/a/folder/';
    // TODO make service, that parses the book
    $http.get(pageHref).success(function(data){
      $scope.page = data.replace(/src="/g, 'style="max-width:100%" src="'+pageFolder);
      $scope.page = $scope.page.replace(/href="http/g, 'link-location="http');
      $scope.page = $scope.page.replace(/href="https/g, 'link-location="https');
      $scope.page = $scope.page.replace(/href="/g, 'link-location="'+pageFolder);
      $scope.page = $scope.page.replace(/<style/g, '<div style="display:none">');
      $scope.page = $scope.page.replace(/<\/style>/g, '</div>');
      $scope.page = $scope.page.replace(/<link/g, '<br style="display:none;"');
    });
  };

  $scope.renderPageLink = function(link){
    if(validURL(link)) {
      window.open(link, '_tab');
    } else {
      for(var i in $scope.book.opf.manifest){
        if($scope.book.opf.manifest[i].href === link){
          for(var j = 0; j<$scope.book.opf.spines.length; j++){
            if($scope.book.opf.spines[j] === i){
              $scope.book.users[userIndex].position = j;
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
      // if he is not, scroll down
      $scope.scrolled = $("#page-preview").scrollTop() + ($("#page-preview").height() - 50);
      $("#page-preview").scrollTop($scope.scrolled);
    } else {
      // else, render next page
      $scope.updatePosition(1);
    }
  };

  $scope.previousPage = function(){
    if(!scrolledToTop()){
      // if he is not, scroll up
      $scope.scrolled = $("#page-preview").scrollTop() - ($("#page-preview").height() - 50);
      $("#page-preview").scrollTop($scope.scrolled);
    } else {
      // else, render next page
      $scope.updatePosition(-1);
    }
  };

  var scrolledToBottom = function(){
    var elem = $('#page-preview');
    return elem[0].scrollHeight - elem.scrollTop() - elem.outerHeight() <= 0;
  };

  var scrolledToTop = function(){
    var elem = $('#page-preview');
    return elem.scrollTop() === 0;
  };

  var updateUserPosition = function(){
    var data = {
      userIndex : userIndex,
      position: $scope.book.users[userIndex].position
    };
    Book.updateUserPosition(book_id, data).success(function(data){
      if(!data.success){
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
