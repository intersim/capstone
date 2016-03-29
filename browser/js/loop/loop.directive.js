'use strict';

app.directive('loopItem', function() {
  return {
    restrict: 'E',
    templateUrl: '/js/loop/loop.detail.html',
    scope: {
    	loop: '='
    },
    controller: function($scope, UserFactory){

        UserFactory.inLoop($scope.loop)
        .then(function(value){
            $scope.added=value;
            console.log("scope added", $scope.added)
        })

    	$scope.toggle = function(){
            //checker
    		if($scope.added) {
    			removeFromBucket()
    		} else {
    			addToBucket()
    		}
    		$scope.added=!$scope.added;
    	}

	    function addToBucket() {
			UserFactory.addToBucket($scope.loop)
		}
		function removeFromBucket() {
			UserFactory.removeFromBucket($scope.loop)
		}
    }
  };
});
