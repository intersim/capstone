'use strict';

app.directive('loopItem', function() {
  return {
    restrict: 'E',
    templateUrl: '/js/common/directives/loop/loop.html',
    scope: {
      loop: '='
    },
    controller: function($scope, UserFactory, AuthService, LoopFactory){

      // generate random ID for canvas
      function guidGenerator() {
          var S4 = function() {
             return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
          };
          return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
      }

      $scope.uniqueId = guidGenerator();

      // initialize canvas with small cellSize, and minify=true
      var canvas = LoopFactory.initialize($scope.uniqueId, 12, true);
      // draw the loop onto the canvas
      LoopFactory.drawLoop($scope.loop, canvas);

      UserFactory.inBucket($scope.loop)
      .then(function(value){
          $scope.added=value;
          console.log("scope added", $scope.added)
      })

      AuthService.getLoggedInUser()
      .then(function(user) {
        $scope.belongsToUser = (user._id === $scope.loop._id);
      })

      function addToBucket() {
        UserFactory.addToBucket($scope.loop)
      }
      function removeFromBucket() {
        UserFactory.removeFromBucket($scope.loop)
      }

      $scope.toggle = function(){
            //checker
        if($scope.added) {
          removeFromBucket()
        } else {
          addToBucket()
        }
        $scope.added=!$scope.added;
      }


    }
  };
});
