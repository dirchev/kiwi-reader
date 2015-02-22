app.controller('BooksCtrl', function($scope, $http, $sce, Book){
  $scope.selectedText = '';

  var getBooks = function(){
    Book.get().success(function(data){
      if(data.success){
        $scope.books = data.books;
      } else {
        toastr.error(data.message);
      }
    });
  };

  $scope.newBook = function(data){
    $('#newBookModal').hide();
    if(data.success){
      getBooks();
      toastr.success('Успешно добавихте нова книга.');
    } else {
      toastr.error(data.message);
    }
  };

  $scope.deleteBook = function(id){
    Book.delete(id).success(function(data){
      if(data.success){
        getBooks();
        toastr.success('Успешно изтрихте книга.');
      } else {
        toastr.error(data.message);
      }
    })
  };

  getBooks();

});
