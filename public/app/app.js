'use strict';

var app = angular.module('kiwiReader', ['ui.bootstrap', 'ui.router', 'ngUpload', 'ui.tinymce']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/files");
  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "public/templates/home.html"
    })
    .state('books', {
      url: "/books",
      templateUrl: "public/templates/books.html",
      controller: "BooksCtrl"
    })
    .state('book', {
      url: "/book/:id",
      templateUrl: "public/templates/book.html",
      controller: "BookCtrl"
    })
    .state('files', {
      url: "/files",
      templateUrl: "public/templates/files.html",
      controller: "FilesCtrl"
    })
    .state('file', {
      url: "/file/:id/:anotation",
      templateUrl: "public/templates/file.html",
      controller: "FileCtrl"
    })
    .state('settings', {
      url: "/settings",
      templateUrl: "public/templates/settings.html",
      controller: "SettingsCtrl"
    })
    .state('library', {
      url: "/library",
      templateUrl: "public/templates/library.html",
      //controller: "SettingsCtrl"
    });
});

app.run(function($rootScope, $http){
  $http.get('/api/user').success(function(data){
    $rootScope.user = data;
  })
});
