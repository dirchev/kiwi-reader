app.controller('IndexCtrl', function(localStorageService, $scope, jwtHelper, $state){
	var token = localStorageService.get('access-token');
	if (token && !jwtHelper.isTokenExpired(token)) {
		$state.go('app.home');
	}
});