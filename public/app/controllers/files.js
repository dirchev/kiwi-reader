app.controller("FilesCtrl", function($scope, $http, File, dropboxChooserService){
  var getFiles = function(){
    File.get().success(function(data){
      $scope.files = data;
    });
  }
  
  getFiles();
  
  $scope.chooseFromDropbox = function(){
    dropboxChooserService.choose($scope.dropboxOptions);
  }
  
  $scope.dropboxOptions = {
    success: function(files){
      var dropboxFile = files[0][0];
      File.createDropboxFile(dropboxFile).success(function(data){
        if(data.success){
          getFiles();
          toastr.success('Успешно създадохте файл.');
        } else {
          toastr.error(data.message);
        }
      });
    },
    linkType: "direct",
    multiselect: false,
    extensions: ['.txt', '.docx']
  };
  
  
  $scope.newFile = function(){
    File.create().success(function(data){
      if(data.success){
        getFiles();
        toastr.success('Успешно създадохте файл.');
      }
    });
  };

  $scope.deleteFile = function(file_id){
    File.delete(file_id).success(function(data){
      File.get().success(function(data){
        $scope.files = data;
      toastr.success('Успешно изтрихте файл.');
      });
    });
  };
  
  $scope.rename = function(file_id, name){
    File.rename(file_id, name).success(function(data){
      if(data.success){
        toastr.success('Успешно променихте името');
      } else {
        toastr.error(data.message);
      }
    });
    File.get().success(function(data){
      $scope.files = data;
    });
  };

  $scope.newTxtFile = function(response){
    var data = response.data;
    if(data.success){
      File.get().success(function(data2){
        $scope.files = data2;
        $('#newTxtFileModal').modal('hide');
        toastr.success('Успешно създадохте файл.');
      });
    } else {
      $('#newTxtFileModal').modal('hide');
      toastr.error(data.message);
    }
    $('#createDocFile').button('reset');
  };

});
