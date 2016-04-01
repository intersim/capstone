'use strict';

app.directive('loopItem', function() {
  return {
    restrict: 'E',
    templateUrl: '/js/common/directives/loop/loop.html',
    // AW: pass in the user 
    scope: {
      loop: '='
    },
    controller: function($scope, UserFactory, AuthService){

      UserFactory.inBucket($scope.loop)
      .then(function(value){
          $scope.added=value;
          console.log("scope added", $scope.added)
      })

      // AW: pass in user via isolate scope?
      AuthService.getLoggedInUser()
      .then(function(user) {
        $scope.belongsToUser = (user._id === $scope.loop._id);
      })

      function addToBucket() {
        //AW: catch error
        UserFactory.addToBucket($scope.loop)
      }
      function removeFromBucket() {
        // AW: catch error 
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
