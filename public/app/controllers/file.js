app.controller("FileCtrl", function($scope, $stateParams, $sce, File, $rootScope,
$location, $anchorScroll, $window, $timeout, Bookmark, Friend){

  $scope.editMode = false;
  $scope.selectedText = '';
  $scope.comment = '';
  $scope.anotationBox = false;
  $scope.chat = [];
  $scope.openedAnotations = [];
  var socket;
  var file_id = $stateParams.id;
  $scope.friends = [];
  var lastEmittedContent = '';

  // share typehead
  $scope.getFriends = function(val) {
    Friend.get().success(function(data){
      $scope.friends = data.friends;
    });
  };

  // TODO move this to directives
  // calculate contentWrapper height
  $scope.contentHeight = $(window).height() - 2*64 - 100;
  $('#contentWrapper').height($scope.contentHeight);
  $(window).resize(function(){
    $scope.contentHeight = $(window).height() - 2*64 - 100;
  $('#contentWrapper').height($scope.contentHeight);
  });

  File.getOne(file_id).success(function(data){
    $scope.file = data;
    // TODO move this operation in backend
    File.getShared(file_id).success(function(data){
      if(data.success){
        $scope.file.sharedUsers = data.users;
      }
    });

    for(var i in $scope.file.anotations){
      $scope.openedAnotations.push(false);
    }

    $scope.$watch('openedAnotations', function(newAnotations){
      $('.selected').css('background-color', '#f7ff00');
      for(var i in $scope.openedAnotations){
        if($scope.openedAnotations[i] === true){
          selectAnotation(i);
        }
      }
    },true);

    if($scope.file.content === ''){
      $scope.editMode = true;
    }

    socket = $window.io();
    socket.emit('open:file', file_id);
    // TODO show all online users

    // WATCH DIFFERENT VARIABLES FOR CHANGE ------------------------------------
    $scope.$watch('file.public', function(oldVal, newVal){
      if(oldVal !== newVal){
        File.public($scope.file._id, $scope.file.public).success(function(data){
          if(data.success){
            var msg = 'Успешно променихте файла на ';
            msg+= $scope.file.public === false ? 'частен.' : 'публичен.';
            toastr.success(msg);
          } else {
            toastr.error(data.message);
        }
        });
      }
    });

    $scope.$watch('file.content', function(oldVal, newVal){
      if(newVal !== lastEmittedContent){
        $timeout(function(){
          socket.emit('file:set:content', {file_id: file_id, content: $scope.file.content});
          $timeout.cancel();
        }, 1000);
      }
    });


    // TODO move login from sockets in factory or sevice
    socket.on('file:update:content', function(content){
      lastEmittedContent = content;
      $scope.$apply(function(){
        $scope.file.content = content;
        $scope.checkForDeletedAnotations();
      });
    });

    socket.on('file:update:anotations', function(anotation){
      $scope.$apply(function(){
        $scope.file.anotations.push(anotation);
      });
    });

    socket.on('file:delete:anotation', function(anotation_index){
      $scope.$apply(function(){
        $scope.file.anotations.splice(anotation_index, 1);
      });
    });

    socket.on('file:update:comment', function(data){
      $scope.$apply(function(){
        $scope.file.anotations[data.anotation_index].comments.push(data.comment);
      });
    });

    socket.on('file:update:chat', function(message){
      $scope.$apply(function(){
        $scope.chat.push(message);
        // TODO fix this quickfix
        $timeout(function(){
          $("#chatBox").scrollTop($("#chatBox").height());
        }, 200);
      });
    });

    socket.on('error', function(error){
      toastr.error(error);
    });
  });

  // SCOPE FUNCTIONS -----------------------------------------------------------
  $scope.addChatMessage = function(message){
    var data = {
      file_id : file_id,
      message: {
        user : $rootScope.user.name,
        content : message
      }
    };
    socket.emit('file:add:chat', data);
    $scope.chat.push(data.message);
    $scope.chatMessage = '';
    // TODO fix this quickfix
    $timeout(function(){
      $("#chatBox").scrollTop($("#chatBox").height());
    }, 200);
  };

  // adds anotation
  $scope.addAnotation = function(){
    var id;
    // find the best id for the anotation
    if($scope.file.anotations.length === 0){
      id = '0';
    } else {
      id = parseInt($scope.file.anotations[$scope.file.anotations.length - 1]._id);
      id = id + 1;
    }

    // prepare the object
    var data = {
      anotation: {
        _id: id,
        user: {
          _id: $rootScope.user._id,
          name: $rootScope.user.name
        },
        title: $scope.anotation
      },
      file_id: file_id,
      comments: []
    };

    // wraps anotation`s content with <span> with special id
    var selection = $scope.selection;
    var span = document.createElement("span");
    span.appendChild(selection.extractContents());
    span.setAttribute('id', 'selection' + id);
    span.setAttribute('class', 'selected');
    selection.insertNode(span);
    $scope.file.content = $('#previewBox').html();

    // resets all variables, linked with anotation
    $scope.cancelAnotation();
    // pushes anotation to local object
    $scope.file.anotations.push(data.anotation);
    // emits new anotation
    socket.emit('file:add:anotation', data);

    // emits updated content
    socket.emit('file:set:content', {file_id: file_id, content: $scope.file.content});
  };

  // highlights anotation and opens its dialog
  var selectAnotation = function(index){
    var anotation = $scope.file.anotations[index];
    $('.selected').css('background-color', '#f7ff00');
    var old = $location.hash();
    $location.hash('selection' + anotation._id);
    $anchorScroll();
    $location.hash(old);
    $('#selection' + anotation._id).css('background-color', '#ffab7b');
  };

  // deselects anotation and closes its dialog
  var deSelectAnotation = function(index){
    var anotation = $scope.file.anotations[index];
    $('.selected').css('background-color', '#f7ff00');
    var old = $location.hash();
    $location.hash('selection' + anotation._id);
    $anchorScroll();
    $location.hash(old);
    $('#selection' + anotation._id).css('background-color', '#f7ff00');
  };

  $scope.toggleEditMode = function(){
    $scope.editMode = !$scope.editMode;
    $scope.checkForDeletedAnotations();
  };

  // share file to another user
  $scope.shareFile = function(user){
    File.share(file_id, user).success(function(data){
        if(data.success){
          File.getShared(file_id).success(function(data){
            if(data.success){
              $scope.file.sharedUsers = data.users;
            }
          });
          toastr.success('Успешно споделяне.');
        } else {
          toastr.error(data.message.toString(), 'Неуспешно споделяне.');
        }
      });
  };

  // TODO this can be fixed
  // checks if there is deleted anotation (from file contents) and removes its anotation object
  $scope.checkForDeletedAnotations = function(){
    if(typeof $scope.file !== 'undefined'){
      for(var i in $scope.file.anotations){
        if(!$('#selection' + $scope.file.anotations[i]._id).length || emptyElement($('#selection' + $scope.file.anotations[i]._id))){
          var anotation = $scope.file.anotations[i]._id;
          socket.emit('file:delete:anotation', {file_id: file_id, anotation_index: i});
          $scope.file.anotations.splice(i,1);
        }
      }
    }
  };

  // delete anotation
  $scope.deleteAnotation = function(anotation_id){
    if(typeof $scope.file !== 'undefined'){
      for(var i in $scope.file.anotations){
        if($scope.file.anotations[i]._id === anotation_id){
          var anotation = $scope.file.anotations[i]._id;
          socket.emit('file:delete:anotation', {file_id: file_id, anotation_index: i});
          $scope.file.anotations.splice(i,1);
          $("#selection" + anotation_id).contents().unwrap();
          $scope.file.content = $('#previewBox').html();
        }
      }
    }
  };

  // checks if the element has content
  var emptyElement =  function( el ){
      return !$.trim(el.html());
  };

  // reserts all variables linked with anotation
  $scope.cancelAnotation = function(){
    $scope.anotation = '';
    $scope.selection = '';
    $scope.selectedText = '';
    $scope.anotationBox = false;
  };

  // add comment to anotation
  $scope.addComment = function(anotation_index, comment_content){
    // prepare comment object
    var comment = {
      user: {
        _id: $rootScope.user._id,
        name: $rootScope.user.name
      },
      content: comment_content
    };
    // check if comments is defined
    if( typeof $scope.file.anotations[anotation_index].comments  === 'undefined'){
      // if not - define it
      $scope.file.anotations[anotation_index].comments = [];
    }
    // push the comment in anotation`s comments
    $scope.file.anotations[anotation_index].comments.push(comment);
    // prepare new object for socket
    var data = {
      file_id : file_id,
      anotation_index : anotation_index,
      comment : comment
    };
    // emit the comment
    socket.emit('file:add:comment', data);
  };

  $scope.addBookmark = function(){
    var bookmark = $scope.selectedText;
    Bookmark.add(bookmark).success(function(data){
      if(data.success){
        toastr.success('Цитатът е запазен успешно.');
        $scope.cancelAnotation();
      } else {
        toastr.error(data.message);
      }
    });
  };

  // show anotations popups
  $(document).on("mouseover", ".selected", function() {
    var id = $(this).attr('id');
    if(typeof id === 'undefined'){
      $(this).contents().unwrap();
      $scope.file.content = $('#previewBox').html();
    } else {
      var anotation_id = id.substr(9);
      var found = false;
      for(var i in $scope.file.anotations){
        if($scope.file.anotations[i]._id === anotation_id){
          found = true;
          $(this).popover({
            content: $scope.file.anotations[i].title,
            placement: 'top'
          });
          $(this).popover('show');
          break;
        }
      }
      if(!found){
        $(this).contents().unwrap();
        $scope.file.content = $('#previewBox').html();
      }
    }
  });

  // hide anotations popups
  $(document).on("mouseleave", ".selected", function() {
    $(this).popover('hide');
  });



});
