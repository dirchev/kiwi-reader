app.controller("FileCtrl", function($scope, $stateParams, $sce, File, $rootScope, $location, $anchorScroll, $window, $timeout){
  $scope.editMode = false;
  $scope.selectedText = '';
  $scope.comment = '';
  $scope.anotationBox = false;

  $scope.editModeOptions = {
    menubar    : false,
    height     : '500px',
    resize     : false,
    code       : true
  };
  $scope.openedAnotations = [];
  var socket;
  var file_id = $stateParams.id;

  File.getOne(file_id).success(function(data){
    $scope.file = data;
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


    // When connection is not that fast, this is not working as it has to
    // $scope.$watch('file.title', function(){
    //   socket.emit('set:title', {file_id: file_id, title: $scope.file.title});
    // });
    // $scope.$watch('file.content', function(){
    //   socket.emit('set:content', {file_id: file_id, content: $scope.file.content});
    // });

    $scope.$watch('file.title', function(){
      $timeout(function(){
        socket.emit('set:title', {file_id: file_id, title: $scope.file.title});
        $timeout.cancel();
      }, 1000);
    });
    $scope.$watch('file.content', function(){
      $timeout(function(){
        socket.emit('set:content', {file_id: file_id, content: $scope.file.content});
        $timeout.cancel();
      }, 1000);
    });

    socket.on('update:title', function(title){
      $scope.$apply(function(){
        $scope.file.title = title;
      });
    });

    socket.on('update:content', function(content){
      $scope.$apply(function(){
        $scope.file.content = content;
        $scope.checkForDeletedAnotations();
      });
    });

    socket.on('update:anotations', function(anotation){
      $scope.$apply(function(){
        $scope.file.anotations.push(anotation);
      });
    });

    socket.on('delete:anotation', function(anotation_index){
      $scope.$apply(function(){
        $scope.file.anotations.splice(anotation_index, 1);
      });
    });

    socket.on('update:comment', function(data){
      $scope.$apply(function(){
        $scope.file.anotations[data.anotation_index].comments.push(data.comment);
      });
    });

    socket.on('error', function(error){
      toastr.error(error);
    });
  });

  $scope.addAnotation = function(){
    var id;
    if($scope.file.anotations.length === 0){
      id = '0';
    } else {
      id = parseInt($scope.file.anotations[$scope.file.anotations.length - 1]._id);
      id = id + 1;
    }
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
    var selection = $scope.selection;
    var span = document.createElement("span");
    span.appendChild(selection.extractContents());
    span.setAttribute('id', 'selection' + id);
    span.setAttribute('class', 'selected');
    selection.insertNode(span);
    $scope.file.content = $('#previewBox').html();
    socket.emit('set:content', {file_id: file_id, content: $scope.file.content});
    $scope.cancelAnotation();
    $scope.file.anotations.push(data.anotation);
    socket.emit('add:anotation', data);
  };


  var selectAnotation = function(index){
    var anotation = $scope.file.anotations[index];
    $('.selected').css('background-color', '#f7ff00');
    var old = $location.hash();
    $location.hash('selection' + anotation._id);
    $anchorScroll();
    $location.hash(old);
    $('#selection' + anotation._id).css('background-color', '#ffab7b');
  };

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

  $scope.checkForDeletedAnotations = function(){
    if(typeof $scope.file !== 'undefined'){
      for(var i in $scope.file.anotations){
        if(!$('#selection' + $scope.file.anotations[i]._id).length || emptyElement($('#selection' + $scope.file.anotations[i]._id))){
          var anotation = $scope.file.anotations[i]._id;
          socket.emit('delete:anotation', {file_id: file_id, anotation_index: i});
          $scope.file.anotations.splice(i,1);
        }
      }
    }
  };

  $scope.deleteAnotation = function(anotation_id){
    if(typeof $scope.file !== 'undefined'){
      for(var i in $scope.file.anotations){
        if($scope.file.anotations[i]._id === anotation_id){
          var anotation = $scope.file.anotations[i]._id;
          socket.emit('delete:anotation', {file_id: file_id, anotation_index: i});
          $scope.file.anotations.splice(i,1);
          $("#selection" + anotation_id).contents().unwrap();
          $scope.file.content = $('#previewBox').html();
        }
      }
    }
  };

  var emptyElement =  function( el ){
      return !$.trim(el.html());
  };

  $scope.cancelAnotation = function(){
    $scope.anotation = '';
    $scope.selection = '';
    $scope.selectedText = '';
    $scope.anotationBox = false;
  };

  $scope.addComment = function(anotation_index, comment_content){
    var comment = {
      user: {
        _id: $rootScope.user._id,
        name: $rootScope.user.name
      },
      content: comment_content
    };
    if( typeof $scope.file.anotations[anotation_index].comments  === 'undefined'){
      $scope.file.anotations[anotation_index].comments = [];
    }
    $scope.file.anotations[anotation_index].comments.push(comment);
    var data = {
      file_id : file_id,
      anotation_index : anotation_index,
      comment : comment
    };
    socket.emit('add:comment', data);
  };

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

  $(document).on("mouseleave", ".selected", function() {
    $(this).popover('hide');
  });


});
