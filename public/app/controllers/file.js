app.controller("FileCtrl", function($scope, $http, $stateParams, $sce, File, $rootScope, $location, $anchorScroll){
  $scope.editMode = false;
  $scope.selectedText = '';
  $scope.selection;
  $scope.anotationBox = false;
  $scope.editModeOptions = {
    menubar    : false,
    height     : '500px',
    resize     : false,
    code       : true
  }
  var file_id = $stateParams.id;

  File.getOne(file_id).success(function(data){
    $scope.file = data;
    if($scope.file.content === ''){
      $scope.editMode = true;
    }
  });

  var updateFile = function(cb){
    File.update(file_id, $scope.file)
      .success(function(data){
        File.getOne(file_id).success(function(file){
          $scope.file = file;
          if(cb){
            cb();
          }
        })
      });
  }

  $scope.toggleEditMode = function(){
    $scope.editMode = !$scope.editMode;
    updateFile(function(){
      $scope.checkForDeletedAnotations();
    });
  }
  $scope.checkForDeletedAnotations = function(){
    var updated = false;
    if(typeof $scope.file !== 'undefined'){
      for(i in $scope.file.anotations){
        if(!$('#selection' + $scope.file.anotations[i]._id).length || emptyElement($('#selection' + $scope.file.anotations[i]._id))){
          $scope.file.anotations.splice(i, 1);
          updated = true;
        }
      }
      if(updated){
        File.updateAnotations(file_id, $scope.file.anotations).success(function(data){
          if(data.success){
            toastr.warning('Изтрихте текст, върху който беше направена анотация. Анотацията е изтрита автоматично.');
            File.getOne(file_id).success(function(data){
              $scope.file = data;
            })
          } else {
            toastr.error(data.msg)
          }
        })
      }
    }
  }

  $scope.selectAnotation = function(anotation, index){
    $('.selected').css('background-color', '#f7ff00');
    var old = $location.hash();
    $location.hash('selection'+index);
    $anchorScroll()
    $location.hash(old);
    $('#selection' + index).css('background-color', '#3b91db');
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
