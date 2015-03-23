app.controller("FilesCtrl", function($scope, $http, File){
  File.get().success(function(data){
    $scope.files = data;
  });

  $scope.newFile = function(){
    File.create().success(function(data){
      if(data.success){
        File.get().success(function(data){
          $scope.files = data;
          toastr.success('Успешно създадохте файл.');
        });
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

  $scope.shareFile = function(file, user, index){
    File.share(file, user).success(function(data){
        if(data.success){
          File.get().success(function(data){
            $scope.files = data;
            toastr.success('Успешно споделяне.');
          });
        } else {
          toastr.error(data.message.toString(), 'Неуспешно споделяне.');
        }
      });
    $scope.getSharedUsers(file, index);
  };

  $scope.getSharedUsers = function(file_id, index){
    File.getShared(file_id).success(function(data){
      if(data.success){
        $scope.files[index].sharedUsers = data.users;
      }
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

  $scope.newTxtFile = function(data){
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
