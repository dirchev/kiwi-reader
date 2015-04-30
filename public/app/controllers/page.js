app.controller('PageCtrl', function($scope, Page, $stateParams, Bookmark, $window, $rootScope, $timeout, $anchorScroll, $location){

  var page_id = $stateParams.id;
  $scope.chat = [];

  var getPage = function(socket){
    Page.getOne(page_id).success(function(data){
      if(data.success){
        $scope.page = data.page;
      } else {
        toastr.error(data.message);
      }
    });
  };

  // Socket
  socket = $window.io();
  socket.emit('open:page', page_id);

  socket.on('page:update:content', function(content){
    $scope.$apply(function(){
      $scope.page.content = content;
    });
  });

  socket.on('page:update:anotations', function(anotation){
    $scope.$apply(function(){
      $scope.page.anotations.push(anotation);
    });
  });

  socket.on('page:update:chat', function(message){
    $scope.$apply(function(){
      $scope.chat.push(message);
      $timeout(function(){
        $("#chatBox").scrollTop($scope.chat.length*66);
      }, 200);
    });
  });

  socket.on('page:delete:anotation', function(anotation_index){
    $scope.$apply(function(){
      $scope.page.anotations.splice(anotation_index, 1);
    });
  });
  
  socket.on('page:add:comment', function(data){
    $scope.$apply(function(){
      if( typeof $scope.page.anotations[data.anotation_index].comments === 'undefined' ){
        $scope.page.anotations[data.anotation_index].comments = [];
      }
      $scope.page.anotations[data.anotation_index].comments.push(data.comment);
    });
  });


  // TODO move this to directives
  // calculate contentWrapper height
  $scope.contentHeight = $(window).height() - 2*64 - 70;
  $('#contentWrapper').height($scope.contentHeight);
  $('#chatContainer').height($scope.contentHeight);
  $(window).resize(function(){
    $scope.contentHeight = $(window).height() - 2*64 - 70;
  $('#contentWrapper').height($scope.contentHeight);
  $('#chatContainer').height($scope.contentHeight);
  });


  $scope.share = function(page_id, user_email){
    Page.share(page_id, user_email).success(function(data){
      if(data.success){
        toastr.success('Статията е споделена успешно');
        getPage();
      } else {
        toastr.error(data.message);
      }
    });
  };

  $scope.addChatMessage = function(message){
    var data = {
      page_id : page_id,
      message: {
        user : $rootScope.user.data.name,
        content : message
      }
    };
    socket.emit('page:add:chat', data);
    $scope.chat.push(data.message);
    $scope.chatMessage = '';

    // TODO fix this quickfix
    $timeout(function(){
      $("#chatBox").scrollTop($scope.chat.length*66);
    }, 200);
  };

  $scope.addAnotation = function(anotation_content){
    var id;
    // find the best id for the anotation
    if($scope.page.anotations.length === 0){
      id = '0';
    } else {
      id = parseInt($scope.page.anotations[$scope.page.anotations.length - 1]._id);
      id = id + 1;
    }
    var data = {
      anotation : {
        _id: id,
        user: $rootScope.user._id,
        title: $scope.anotation
      },
      populatedAnotation : {
        _id: id,
        user: {
          _id : $rootScope.user._id,
          data : {name : $rootScope.user.data.name}
        },
        title : $scope.anotation
      },
      page_id : page_id,
      comments : []
    };
    createAnotationSpan(id);

    // pushes anotation to local array
    $scope.page.anotations.push(data.populatedAnotation);

    // emits new anotation
    socket.emit('page:add:anotation', data);

    $scope.updateContent();
  };

  $scope.share = function(user){
    Page.share(page_id, user).success(function(data){
        if(data.success){
          getPage();
          toastr.success('Успешно споделяне.');
        } else {
          toastr.error(data.message.toString(), 'Неуспешно споделяне.');
        }
      });
  };

  $scope.updateContent = function(){
    // gets content from div
    $scope.page.content = $('#previewBox').html();

    // emits updated content
    socket.emit('page:set:content', {page_id: page_id, content: $scope.page.content});
  };

  $scope.deleteAnotation = function(anotation_index){
    // get anotation form array
    var anotation = $scope.page.anotations[anotation_index];
    // delete anotation span
    $("#selection" + anotation._id).contents().unwrap();
    // update and emit content
    $scope.updateContent();
    // delete anotation from array
    $scope.page.anotations.splice(anotation_index,1);
    // emit to socket
    socket.emit('page:delete:anotation', {page_id: page_id, anotation_index: anotation_index});
  };

  $scope.addComment = function(anotation_index, comment_content){
    // prepare comment object
    var data = {
      page_id : page_id,
      anotation_index : anotation_index,
      comment: {
        user : $rootScope.user._id,
        content : comment_content
      },
      populatedComment: {
        user: {
          _id: $rootScope.user._id,
          data: { name: $rootScope.user.data.name }
        },
        content: comment_content
      }
    };
    // check if comments var is defined
    if( typeof $scope.page.anotations[anotation_index].comments === 'undefined'){
      // if not - define it as array
      $scope.page.anotations[anotation_index].comments = [];
    }
    
    // push the commetn on local anotation`s comments
    $scope.page.anotations[anotation_index].comments.push(data.populatedComment);
    
    //emit comment to socket
    socket.emit('page:add:comment', data);
    
  };

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

  // highlights anotation and opens its dialog
  var selectAnotation = function(index){
    var anotation = $scope.page.anotations[index];
    $('.selected').css('background-color', '#f7ff00');
    var old = $location.hash();
    $location.hash('selection' + anotation._id);
    $anchorScroll();
    $location.hash(old);
    $('#selection' + anotation._id).css('background-color', '#ffab7b');
  };

  // deselects anotation and closes its dialog
  var deSelectAnotation = function(index){
    var anotation = $scope.page.anotations[index];
    $('.selected').css('background-color', '#f7ff00');
    var old = $location.hash();
    $location.hash('selection' + anotation._id);
    $anchorScroll();
    $location.hash(old);
    $('#selection' + anotation._id).css('background-color', '#f7ff00');
  };

  getPage(true);

  // show anotations popups
  $(document).on("mouseover", ".selected", function() {
    var id = $(this).attr('id');
    var anotation_id = id.substr(9);
    var found = false;
    for(var i in $scope.page.anotations){
      if($scope.page.anotations[i]._id === anotation_id){
        found = true;
        $(this).popover({
          content: $scope.page.anotations[i].title,
          placement: 'top'
        });
        $(this).popover('show');
        break;
      }
    }
  });

  // hide anotations popups
  $(document).on("mouseleave", ".selected", function() {
    $(this).popover('hide');
  });

  $scope.cancelAnotation = function(){
    $scope.anotation = '';
    $scope.selection = '';
    $scope.selectedText = '';
    $scope.anotationBox = false;
  };

  var createAnotationSpan = function(id){
    // wraps anotation`s content with <span> with special id
    var selection = $scope.selection;
    var span = document.createElement("span");
    span.appendChild(selection.extractContents());
    span.setAttribute('id', 'selection' + id);
    span.setAttribute('class', 'selected');
    selection.insertNode(span);

    // resets all variables, linked with anotation
    $scope.cancelAnotation();
  };

});
