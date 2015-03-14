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

  $scope.shareBook = function(book, user){
    Book.share(book, user).success(function(data){
      if(data.success){
        toastr.success('Успешно споделяне.');
        getBooks();
        $('.collapse').hide();
      } else {
        toastr.error(data.message.toString(), 'Неуспешно споделяне.');
      }
    });
  };

  $scope.getSharedUsers = function(book_id, index){
    Book.getShared(book_id).success(function(data){
      if(data.success){
        $scope.books[index].sharedUsers = data.users;
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
