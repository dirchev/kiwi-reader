app.controller('BooksCtrl', function($scope, $http, $sce, Book){
  $scope.selectedText = '';

  var getBooks = function(){
    Book.get().success(function(data){
      $scope.books = data;
    });
  };

  $scope.newBook = function(){
    Book.create().success(function(data){
      getBooks();
      toastr.success('Успешно добавихте нова книга.');
    })
  };

  $scope.deleteBook = function(id){
    Book.delete(id).success(function(data){
      getBooks();
      toastr.success('Успешно изтрихте книга.');
    })
  };

  getBooks();

});
