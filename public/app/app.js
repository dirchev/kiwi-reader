'use strict';

var app = angular.module('kiwiReader', ['ui.bootstrap', 'ui.router', 'ngUpload', 'ui.tinymce', 'btford.socket-io']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/files");
  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "/templates/home.html"
    })
    .state('books', {
      url: "/books",
      templateUrl: "/templates/books.html",
      controller: "BooksCtrl"
    })
    .state('book', {
      url: "/book/:id",
      templateUrl: "/templates/book.html",
      controller: "BookCtrl"
    })
    .state('files', {
      url: "/files",
      templateUrl: "/templates/files.html",
      controller: "FilesCtrl"
    })
    .state('file', {
      url: "/file/:id/:anotation",
      templateUrl: "/templates/file.html",
      controller: "FileCtrl"
    })
    .state('settings', {
      url: "/settings",
      templateUrl: "/templates/settings.html",
      controller: "SettingsCtrl"
    })
    .state('library', {
      url: "/library",
      templateUrl: "/templates/library.html",
      //controller: "SettingsCtrl"
    })
    .state('profile', {
      url: "/profile",
      templateUrl: "/templates/profile.html",
      controller: "ProfileCtrl"
    });
});

app.run(function($rootScope, $http){
  $http.get('/api/user').success(function(data){
    $rootScope.user = data;
  })
});
