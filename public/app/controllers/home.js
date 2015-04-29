app.controller('HomeCtrl', function($rootScope, User){
  // update user to get last visited files
  User.update();
});
