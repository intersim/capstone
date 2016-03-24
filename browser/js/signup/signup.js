'use strict';

app.controller('SignupCtrl', function($scope, AuthService, UserFactory, $state){

  $scope.sendSignup = function(signup){
    var newLogin = {username: signup.username, email: signup.email, password: signup.password};
    UserFactory.create(signup)
    .then(function(newUser){
      return AuthService.login(newLogin);
    })
    .then(function(){
      $state.go('home')
    });
  }
});


app.config(function($stateProvider) {
  $stateProvider.state('signup',{
    url:'/signup',
    templateUrl: '/js/signup/signup.html',
    controller: 'SignupCtrl'
  });
});