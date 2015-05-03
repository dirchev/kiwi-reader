/* global toastr */
app.controller("LoginCtrl", function($scope, $http, localStorageService, $state, User, $rootScope){
	$scope.login = function(email,password){
		$http.post('/authenticate', {email:email, password: password}).success(function(data){
			if(data.success){
				localStorageService.set('access-token', data.token);
				$http.defaults.headers.common['x-access-token'] = data.token;
				User.get().success(function(data){
					if(data.success){
						$rootScope.user = data.user;
						$state.go('app.home');	
					} else {
						toastr.error(data.message);
					}
				});
			} else {
				toastr.error(data.message);
			}
		});
	};
});