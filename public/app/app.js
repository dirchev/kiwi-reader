/* global toastr */
/// <reference path="../../typings/angularjs/angular.d.ts"/>
var app = angular.module('kiwiReader', ['ui.bootstrap', 'LocalStorageModule', 'ui.router', 'ngCkeditor', 'lr.upload', 'dropboxChooserModule', 'angular-loading-bar', 'angular-jwt']);

//routes
app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");
  $stateProvider
    .state('index', {
      isPublic: true,
      url: "/",
      controller: "IndexCtrl",
      templateUrl: "/templates/index.html"
    })
    .state('login', {
      isPublic: true,
      url: "/login",
      controller: "LoginCtrl",
      templateUrl: "/templates/login.html"
    })
    .state('signup', {
      isPublic: true,
      url: "/signup",
      controller: "SignupCtrl",
      templateUrl: "/templates/signup.html"
    })
    .state('app', {
      isPublic: false,
      url: "/app",
      templateUrl: "/templates/app.html",
      controller: "AppCtrl",
      abstract: true
    })
    .state('app.home', {
      isPublic: false,
      url: "/home",
      views: {
        'appView': {
          templateUrl: "/templates/app/home.html",
          controller: "HomeCtrl"
        }
      }
    })
    .state('app.books', {
      isPublic: false,
      url: "/books",
      views: {
        'appView': {
          templateUrl: "/templates/app/books.html",
          controller: "BooksCtrl"
        }
      }
    })
    .state('app.book', {
      isPublic: false,
      url: "/book/:id",
      views: {
        'appView': {
          templateUrl: "/templates/app/book.html",
          controller: "BookCtrl"
        }
      }
    })
    .state('app.files', {
      isPublic: false,
      url: "/files",
      views: {
        'appView': {
          templateUrl: "/templates/app/files.html",
          controller: "FilesCtrl"
        }
      }
    })
    .state('app.file', {
      isPublic: false,
      url: "/file/:id",
      views: {
        'appView': {
          templateUrl: "/templates/app/file.html",
          controller: "FileCtrl"
        }
      }
    })
    .state('app.settings', {
      isPublic: false,
      url: "/settings",
      views: {
        'appView': {
          templateUrl: "/templates/app/settings.html",
          controller: "SettingsCtrl"
        }
      }
    })
    .state('app.library', {
      isPublic: false,
      url: "/library",
      views: {
        'appView': {
          templateUrl: "/templates/app/library.html",
          //controller: "SettingsCtrl"
        }
      }
    })
    .state('app.bookmarks', {
      isPublic: false,
      url: "/bookmarks",
      views: {
        'appView': {
          templateUrl: "/templates/app/bookmarks.html",
          controller: "BookmarksCtrl"
        }
      }
    })
    .state('app.friends', {
      isPublic: false,
      url: "/friends",
      views: {
        'appView': {
          templateUrl: "/templates/app/friends.html",
          controller: "FriendsCtrl"
        }
      }
    })
    .state('app.profile', {
      isPublic: false,
      url: "/profile",
      views: {
        'appView': {
          templateUrl: "/templates/app/profile.html",
          controller: "ProfileCtrl"
        }
      }
    })
    .state('app.pages', {
      isPublic: false,
      url: "/pages",
      views: {
        'appView': {
          templateUrl: "/templates/app/pages.html",
          controller: "PagesCtrl"
        }
      }
    })
    .state('app.page', {
      isPublic: false,
      url: "/page/:id",
      views: {
        'appView': {
          templateUrl: "/templates/app/page.html",
          controller: "PageCtrl"
        }
      }
    });
});

// filter to enable binding html in page
app.filter('trustAsResourceUrl', ['$sce', function ($sce) {
  return function (val) {
    return $sce.trustAsResourceUrl(val);
  };
}]);

// loading bar on all http requests (UX)
app.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = false;
}]);
