app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        controller: 'HomeCtrl',
        templateUrl: 'js/home/home.html'
    });
})

app.controller('HomeCtrl', function($scope, $uibModal){

  var smodal; 

  $scope.open = function () {
    smodal = $uibModal.open(signup)
  }



	var signup = {
		animation: true,
		size: "lg",
		templateUrl: 'js/signup/signup.html',
		controller: function($scope, $uibModalInstance, UserFactory, AuthService){

		    $scope.sendSignup = function(signup){
		    var newLogin = {username: signup.username, email: signup.email, password: signup.password};
		    UserFactory.create(signup)
		    .then(function(newUser){
		      return AuthService.login(newLogin);
		    })
		    .then(function(){
		      $uibModalInstance.close()
		    })
		  }

		    $scope.login = function(){
		  	smodal.close()
			$uibModal.open(login)
		  }

		}
	}

	var login = {
		animation: true,
	    size: "lg",
	    templateUrl: 'js/login/login.html',
	    controller: function($scope, $uibModalInstance, AuthService){

	    $scope.login = {};

	    $scope.sendLogin = function (loginInfo) {

	        $scope.error = null;

	        AuthService.login(loginInfo).then(function () {
	            $state.go('home');
	        }).catch(function () {
	            $scope.error = 'Invalid login credentials.';
	        })

		}

		}
 	}
})