/* global toastr */
/* global app */
app.controller("AppCtrl", function ($scope, $state, $rootScope, localStorageService, jwtHelper, $http, User, $location) {
	var token = localStorageService.get('access-token');
	if (token && !jwtHelper.isTokenExpired(token)) {
		$http.defaults.headers.common['x-access-token'] = token;
		User.get().success(function (data) {
			if (data.success) {
				$rootScope.user = data.user;
			} else {
				toastr.error(data.message);
			}
		});
	} else {
		$location.path('/login');
	}
	
	$scope.logout = function(){
		localStorageService.remove('access-token');
		$state.go('index');
	}
});