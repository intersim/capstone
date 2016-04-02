app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        controller: 'HomeCtrl',
        templateUrl: 'js/home/home.html'
    });
})

app.controller('HomeCtrl', function($scope, $uibModal){

  $scope.open = function () {
    var detailsModal = $uibModal.open({
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

	  $scope.close = function(){
	  	$uibModalInstance.close()
	  }

	}
  })

  }
})