/* global app */
/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/* global toastr */
app.controller('BooksCtrl', function($scope, $http, $sce, Book, dropboxChooserService, upload, localStorageService){

  var getBooks = function(){
    Book.get().success(function(data){
      if(data.success){
        $scope.books = data.books;
      } else {
        toastr.error(data.message);
      }
    });
  };
  
  $scope.chooseFromDropbox = function(){
    dropboxChooserService.choose($scope.dropboxOptions);
  };
  
  $scope.dropboxOptions = {
    success: function(books){
      var dropboxBook = books[0][0];
      Book.createDropboxBook(dropboxBook).success(function(data){
        if(data.success){
          toastr.success('Успешно добавихте нова книга.');
          getBooks();
        } else {
          toastr.error(data.message);
        }
        $('#newBookModal').modal('hide');
      });
    },
    linkType: "direct",
    multiselect: false,
    extensions: ['.txt', '.docx']
  };

  $scope.newBook = function(response){
    var data = response.data;
    if(data.success){
      getBooks();
      toastr.success('Успешно добавихте нова книга.');
    } else {
      toastr.error(data.message);
    }
    $('#newBookModal').modal('hide');
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
