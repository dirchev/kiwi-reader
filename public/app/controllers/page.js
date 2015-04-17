app.controller('PageCtrl', function($scope, Page, $stateParams){

  var page_id = $stateParams.id;

  var getPage = function(socket){
    Page.getOne(page_id).success(function(data){
      if(data.success){
        $scope.page = data.page;
        if(socket){
          startSocket();
        }
      } else {
        toastr.error(data.message);
      }
    });
  };

  var startSocket = function(){
    // TODO socket listener
  };

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

  $scope.addAnotation = function(anotation_content){
    // TODO emit new anotation
    var data = {
      page_id : page_id
    };
  };

  $scope.deleteAnotation = function(anotation_index){
    // TODO emit deleted anotation
  };

  $scope.addComment = function(anotation_index, comment_content){
    // TODO add comment
  };

  getPage(true);

});
