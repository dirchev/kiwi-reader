var app = angular.module('kiwiReader', ['ui.bootstrap', 'ui.router', 'ngUpload', 'ngCkeditor', 'btford.socket-io']);

//routes
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
      url: "/file/:id",
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
    .state('bookmarks', {
      url: "/bookmarks",
      templateUrl: "/templates/bookmarks.html",
      controller: "BookmarksCtrl"
    })
    .state('friends', {
      url: "/friends",
      templateUrl: "/templates/friends.html",
      controller: "FriendsCtrl"
    })
    .state('profile', {
      url: "/profile",
      templateUrl: "/templates/profile.html",
      controller: "ProfileCtrl"
    })
    .state('pages', {
      url: "/pages",
      templateUrl: "/templates/pages.html",
      controller: "PagesCtrl"
    })
    .state('page', {
      url: "/page/:id",
      templateUrl: "/templates/page.html",
      controller: "PageCtrl"
    });
});

app.filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);

app.run(function($rootScope, $http){
  $http.get('/api/user').success(function(data){
    $rootScope.user = data;
  });
});
