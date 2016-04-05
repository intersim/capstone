'use strict';

app.controller('MixesCtrl', function($scope, mixes, MixFactory, AuthService){

  $scope.selected = null;

  $scope.mixes = mixes;

  $scope.select = function(mix) {
    mix.loops = MixFactory.getLoops(mix);
    $scope.selected = mix;
  }

  AuthService.getLoggedInUser()
  .then(function(user) {
    $scope.currentUser = user;
  })


})