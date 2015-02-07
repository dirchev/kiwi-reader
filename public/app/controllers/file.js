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

  var updateFile = function(){
    File.update(file_id, $scope.file)
      .success(function(data){});
  }

  $scope.$watchGroup(['file.title', 'file.content'], function(){
    $('.selected').css('background-color', '#f7ff00');
    checkForDeletedAnotations();
    updateFile();
  });

  var checkForDeletedAnotations = function(){
    if(typeof $scope.file !== 'undefined'){
      for(i in $scope.file.anotations){
        var selection = $('#selection'+i).text().replace('&nbsp;', '').trim();
        if(typeof $('#selection'+i).html() === 'undefined' || $('#selection'+i).text() === ''){
          $scope.file.anotations.splice(i ,1);
        }
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
    var selection = $scope.selection;
    var span = document.createElement("span");
    span.appendChild(selection.extractContents());
    span.setAttribute('id', 'selection' + $scope.file.anotations.length );
    span.setAttribute('class', 'selected');
    span.setAttribute('anotation', '');
    selection.insertNode(span);
    $scope.file.content = $('#previewBox').html();
    $scope.file.anotations.push({user:$rootScope.user._id, content:$scope.anotation});
    $('.selected').css('background-color', '#f7ff00');
    File.update(file_id, $scope.file).success(function(data){
      if(data.success){
        toastr.success('Успешно поставихте коментар.');
      }
      $scope.anotation = '';
      $scope.selection = '';
      $scope.selectedText = '';
      $scope.anotationBox = false;
    })
  }

  $scope.openAnotation = function(index){
    console.log($scope.file.anotations[index]);
  }

  $(document).on("click", ".selected", function() {
    var id = $(this).attr('id');
    var anotation_id = id.substr(9);
    $(this).popover({
      content: $scope.file.anotations[anotation_id].content,
      placement: 'top'
    })
  });
});
