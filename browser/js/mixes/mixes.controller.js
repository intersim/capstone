'use strict';

app.controller('MixesCtrl', function($scope, mixes, MixFactory){

  $scope.selected = null;

  $scope.mixes = mixes;

  $scope.select = function(mix) {
    mix.loops = MixFactory.getLoops(mix);
    $scope.selected = mix;
  }

})