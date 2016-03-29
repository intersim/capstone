'use strict';

app.directive('mixItem', function() {
  return {
    restrict: 'E',
    templateUrl: '/js/mixes/mix.detail.html',
    scope: {
    	mix: '='
    },
    controller: function($scope, UserFactory, $state){

        UserFactory.favorited($scope.mix._id)
        .then(function(value){
            $scope.favorited=value;
        })


        $scope.edit = function(mixId){
            $state.go('editMix', {mixId: mixId})
        }

    	$scope.toggle = function(mixId){
    		if($scope.favorited) {
    			unfavorite(mixId)
    		} else {
    			favorite(mixId)
    		}
    		$scope.favorited=!$scope.favorited;
    	}

	    function favorite(mixId) {
            UserFactory.favorite(mixId)
		}

		function unfavorite(mixId) {
            UserFactory.unfavorite(mixId)
		}
    }
  }
})
