app.controller("FileCtrl", function($scope, $stateParams, File, $rootScope,
$location, $anchorScroll, $window, $timeout, Bookmark, $state){

  $scope.chat = [];
  $scope.openedAnotations = [];
  var socket = $window.io();
  var file_id = $stateParams.id;

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

  File.getOne(file_id).success(function(data){
    if(!data.success){
      toastr.error(data.message);
      $state.go('app.files');
    }
    $scope.file = data.file;
    if(!$scope.file.content || $scope.file.content.length === 0){
      $scope.editMode = true;
    }
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
      $timeout(function(){
        socket.emit('file:set:content', {file_id: file_id, content: $scope.file.content});
        $timeout.cancel();
      }, 1000);
    });


    // TODO move login from sockets in factory or sevice
    socket.on('file:update:content', function(content){
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
          $("#chatBox").scrollTop($scope.chat.length*66);
        }, 200);
      });
    });
  });

  // SCOPE FUNCTIONS -----------------------------------------------------------
  $scope.addChatMessage = function(message){
    var data = {
      file_id : file_id,
      message: {
        user : $rootScope.user.data.name,
        content : message
      }
    };
    socket.emit('file:add:chat', data);
    $scope.chat.push(data.message);
    $scope.chatMessage = '';

    // TODO fix this quickfix
    $timeout(function(){
      $("#chatBox").scrollTop($scope.chat.length*66);
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
      file_id : file_id,
      comments : []
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
    $scope.file.anotations.push(data.populatedAnotation);
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
          File.getOne(file_id).success(function(data){
            $scope.file = data;
            toastr.success('Успешно споделяне.');
          });
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
          var anotation_id = $scope.file.anotations[i]._id;
          $scope.deleteAnotation(anotation_id);
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
    var data = {
      file_id : file_id,
      anotation_index : anotation_index,
      comment : {
        user: $rootScope.user._id,
        content: comment_content
      },
      populatedComment: {
        user: {
          _id: $rootScope.user._id,
          data:{name:$rootScope.user.data.name}
        },
        content: comment_content
      }
    };
    var comment = {
      user: $rootScope.user._id,
      content: comment_content
    };
    // check if comments is defined
    if( typeof $scope.file.anotations[anotation_index].comments  === 'undefined'){
      // if not - define it
      $scope.file.anotations[anotation_index].comments = [];
    }
    // push the comment in anotation`s comments
    $scope.file.anotations[anotation_index].comments.push(data.populatedComment);
    // prepare new object for socket
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
    var anotation_id = id.substr(9);
    var found = false;
    for(var i = 0; i < $scope.file.anotations.length; i++){
      if($scope.file.anotations[i]._id == anotation_id){
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
      $(this).popover({
        content: 'Възникна грешка. F5 и всичко е ОК.',
        placement: 'top'
      });
      $(this).popover('show');
    }
    // if(!found){
    //   $(this).contents().unwrap();
    //   $scope.file.content = $('#previewBox').html();
    // }
  });

  // hide anotations popups
  $(document).on("mouseleave", ".selected", function() {
    $(this).popover('hide');
  });



});
