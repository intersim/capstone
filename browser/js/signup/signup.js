// 'use strict';

// app.controller('SignupCtrl', function($scope, AuthService, UserFactory, $state, $uibModalInstance){

//   $scope.sendSignup = function(signup){
//     var newLogin = {username: signup.username, email: signup.email, password: signup.password};
//     UserFactory.create(signup)
//     .then(function(newUser){
//       console.log('NEW USER', newUser)
//       return AuthService.login(newLogin);
//     })
//     .then(function(){
//       $uibModalInstance.close()
//       // $state.go('home')
//     })
//   }
// })


// app.config(function($stateProvider) {
//   $stateProvider.state('signup',{
//     url:'/signup',
//     templateUrl: '/js/signup/signup.html',
//     controller: 'SignupCtrl'
//   });
// });