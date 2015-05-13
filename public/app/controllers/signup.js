app.controller('SignupCtrl', function($scope, User, $state){
	$scope.signup = function(user){
		User.signup(user).success(function(data){
			if(data.success){
				toastr.success('Успешна регистрация.');
				$state.go('login')
			} else {
				toastr.error(data.message);
			}
		});
	};
});