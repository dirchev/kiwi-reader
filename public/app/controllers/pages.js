app.controller('PagesCtrl', function($scope, $sce, Page, $window, $http){
  var selectedLink = '';
  $scope.selection = '';
  $scope.selectedText = '';
  $scope.pageHTML = 'Постави линк';
  $scope.step = 1;

  $scope.stepBack = function(){
    $scope.step--;
  };

  $scope.getPagePreview =  function(link){
    selectedLink = link;
    $scope.framelink = '/api/page/html?url='+escape(link);
    $scope.step = 2;
  };
  $scope.getSelection = function(){
    $scope.contentPreview = getIframeSelection();
    if($scope.contentPreview.trim() === ''){
      toastr.error('Не сте селектирали нищо.');
    } else {
      $scope.step = 3;
    }
  };

  var getPages = function(){
    Page.get().success(function(data){
      if(data.success){
        $scope.pages = data.pages;
      } else {
        toastr.error(data.message);
      }
    });
  };

  $scope.create = function(){
    Page.create($scope.contentPreview, selectedLink).success(function(data){
      if(data.success){
        toastr.success('Успешно добавихте статия.');
        $('#newPageModal').modal('hide');
        $scope.step = 1;
        getPages();
      } else {
        toastr.error(data.message);
      }
    });
  };

  $scope.rename = function(page_id, name){
    Page.rename(page_id, name).success(function(data){
      if(data.success){
        toastr.success('Статията е преименувана успешно.');
        getPages();
      } else {
        toastr.error(data.message);
      }
    });
  };

  $scope.delete = function(page_id){
    Page.delete(page_id).success(function(data){
      if(data.success){
        getPages();
        toastr.success('Успешно изтрихте страница.');
      } else {
        toastr.error(data.message);
      }
    });
  };

  var validURL= function (str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?','i'); // query string
    if(!pattern.test(str)) {
      return false;
    } else {
      return true;
    }
  };

  function getIframeSelection() {
    var iframe = document.getElementById("pagePreview");
    var win = iframe.contentWindow;
    var doc = iframe.contentDocument || win.document;

    if (win.getSelection) {
      var sel = win.getSelection();
      if (sel.rangeCount) {
          var container = document.createElement("div");
          for (var i = 0, len = sel.rangeCount; i < len; ++i) {
              container.appendChild(sel.getRangeAt(i).cloneContents());
          }
          return container.innerHTML;
      }
    } else if (doc.selection && doc.selection.createRange) {
      return doc.selection.createRange().htmlText;
    }
  }

  getPages();

});
