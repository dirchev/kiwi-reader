app.controller('BooksCtrl', function($scope, $http, $sce, Book){

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


  $scope.rename = function(book_id, name){
    Book.rename(book_id, name).success(function(data){
      if(data.success){
        toastr.success('Успешно променихте името на файла.');
        getBooks();
        $('.rename').hide();
      } else {
        toastr.error(data.message);
      }
    });
  };

  $scope.deleteBook = function(id){
    Book.delete(id).success(function(data){
      if(data.success){
        getBooks();
        toastr.success('Успешно изтрихте книга.');
      } else {
        toastr.error(data.message);
      }
    });
  };

  getBooks();

});
