'use strict';

app.controller('UserPubCtrl', function($scope, $state, theUser, allCompositions, allLoops, allFollowers){
	
	$scope.followers = allFollowers;
	$scope.user = theUser;
	$scope.compositions = allCompositions || 0;
	$scope.loops = allLoops || 0;

})

app.config(function($stateProvider){
	$stateProvider.state('public', {
		url:'/user/:id',
		templateUrl: '/js/user/public/user.html',
		controller: 'UserPubCtrl',
		resolve: {
			theUser: function(UserFactory, $stateParams){
				return UserFactory.fetchById($stateParams.id);
			},
			allLoops: function(LoopFactory, $stateParams){
				return LoopFactory.fetchById($stateParams.id);
			},
			allCompositions: function(CompositionFactory, $stateParams){
				return CompositionFactory.fetchById($stateParams.id);
			},
			allFollowers: function(UserFactory, $stateParams){
				return UserFactory.getFollowers($stateParams.id);
			}
		}
	})
})