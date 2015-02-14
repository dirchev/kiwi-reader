app.controller("FileCtrl", function($scope, $http, $stateParams, $sce, File, $rootScope, $location, $anchorScroll){
  $scope.editMode = false;
  $scope.selectedText = '';
  $scope.selection;
  $scope.anotationBox = false;
  $scope.disableHighlighting = 0;
  $scope.editModeOptions = {
    menubar    : false,
    height     : '500px',
    resize     : false,
    code       : true
  }
  $scope.openedAnotations = [];

  var file_id = $stateParams.id;

  File.getOne(file_id).success(function(data){
    $scope.file = data;
    for(i in $scope.file.anotations){
      $scope.openedAnotations.push(false);
    }
    $scope.$watch('openedAnotations', function(newAnotations){
      $('.selected').css('background-color', '#f7ff00');
      for(i in $scope.openedAnotations){
        if($scope.openedAnotations[i] === true){
          selectAnotation(i);
        }
      }
    },true);
    if($scope.file.content === ''){
      $scope.editMode = true;
    }
  });

  var updateFile = function(cb){
    File.update(file_id, $scope.file)
    .success(function(data){
      File.getOne(file_id).success(function(file){
        $scope.file = file;
        for(i in $scope.file.anotations){
          $scope.openedAnotations.push(false);
        }
        if(cb){
          cb();
        }
      })
    });
  }

  $scope.$watch('file.title', function(){
    updateFile();
  });

  $scope.$watch('disableHighlighting', function(){
    if(!$scope.disableHighlighting){
      $('.selected').css('background-color', '#f7ff00');
    } else {
      $('.selected').css('background-color', 'inherit');
    }
  });


  var selectAnotation = function(index){
    $scope.disableHighlighting = 0;
    var anotation = $scope.file.anotations[index];
    $('.selected').css('background-color', '#f7ff00');
    var old = $location.hash();
    $location.hash('selection' + anotation._id);
    $anchorScroll()
    $location.hash(old);
    $('#selection' + anotation._id).css('background-color', '#ffab7b');
  }

  var deSelectAnotation = function(index){
    var anotation = $scope.file.anotations[index];
    $('.selected').css('background-color', '#f7ff00');
    var old = $location.hash();
    $location.hash('selection' + anotation._id);
    $anchorScroll()
    $location.hash(old);
    $('#selection' + anotation._id).css('background-color', '#f7ff00');
  }

  $scope.toggleEditMode = function(){
    $scope.editMode = !$scope.editMode;
    updateFile(function(){
      $scope.checkForDeletedAnotations();
    });
  }
  $scope.checkForDeletedAnotations = function(){
    if(typeof $scope.file !== 'undefined'){
      for(i in $scope.file.anotations){
        if(!$('#selection' + $scope.file.anotations[i]._id).length || emptyElement($('#selection' + $scope.file.anotations[i]._id))){
          File.deleteAnotation(file_id, $scope.file.anotations[i]._id).success(function(data){
            if(data.success){
              console.log('Успешно изтрихте анотация');
              updateFile();
            } else {
              console.log(data.message);
            }
          })
        }
      }
    }
  }


  $scope.cancelAnotation = function(){
    $scope.anotation = '';
    $scope.selection = '';
    $scope.selectedText = '';
    $scope.anotationBox = false;
  }

  $scope.addAnotation = function(){
    File.addAnotation(file_id, $scope.anotation).success(function(data){
      if(data.success){
        toastr.success('Успешно започнахте коментар.');
        var selection = $scope.selection;
        var span = document.createElement("span");
        span.appendChild(selection.extractContents());
        span.setAttribute('id', 'selection' + data.anotation_id);
        span.setAttribute('class', 'selected');
        selection.insertNode(span);
        $scope.file.content = $('#previewBox').html();
        updateFile();
      }
      $scope.cancelAnotation();
    });
  }

  $scope.addComment = function(anotationIndex, comment){
    File.addComment(file_id, anotationIndex, comment).success(function(data){
      if(data.success){
        updateFile(function(){
          toastr.success('Коментарът е поставен успешно');
        });
      } else {
        toastr.error(data.message);
      }
    })
  }

  var emptyElement =  function( el ){
      return !$.trim(el.html())
  }

  $scope.deleteAnotation = function(anotation_id){
    File.deleteAnotation(file_id, anotation_id).success(function(data){
      if(data.success){
        toastr.success('Успешно изтрихте анотацията.');
        $('#selection'+anotation_id).contents().unwrap();
        $scope.file.content = $('#previewBox').html();
        updateFile();
      } else {
        toastr.error(data.message);
      }
    })
  }

  $(document).on("mouseover", ".selected", function() {
    var id = $(this).attr('id');
    var anotation_id = id.substr(9);
    for(i in $scope.file.anotations){
      if($scope.file.anotations[i]._id === anotation_id){
        $(this).popover({
          content: $scope.file.anotations[i].title,
          placement: 'top'
        });
        $(this).popover('show');
        break;
      }
    }
  });
  $(document).on("mouseleave", ".selected", function() {
    $(this).popover('hide');
  });


});
