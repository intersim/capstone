'use strict';

app.directive('loopItem', function() {
  return {
    restrict: 'E',
    templateUrl: '/js/common/directives/loop/loop.html',
    scope: {
      loop: '='
    },
    controller: function($scope, UserFactory, AuthService){

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
