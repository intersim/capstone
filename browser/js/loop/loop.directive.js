'use strict';

app.directive('loopItem', function() {
  return {
    restrict: 'E',
    templateUrl: '/js/loop/loop.detail.html',
    scope: {
    	loop: '='
    },
    controller: function($scope, UserFactory){
    	$scope.added = false;

    	$scope.toggle = function(){
    		if($scope.added) {
    			removeFromBucket()
    		} else {
    			addToBucket()
    		}
    		$scope.added=!$scope.added;
    	}

	    function addToBucket() {
			UserFactory.addToBucket($scope.loop)
			.then(function(user){
				console.log('user from add', user)
			})
		}
		function removeFromBucket() {
			UserFactory.removeFromBucket($scope.loop)
			.then(function(user){
				console.log('user from remove', user)
			})
		}
    }
  };
});
