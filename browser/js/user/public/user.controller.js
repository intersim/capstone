'use strict';

app.controller('UserPubCtrl', function($scope, $state, theUser, allFollowers, allCompositions, UserFactory){
	
	$scope.followers = allFollowers;
	$scope.user = theUser;
	console.log("THE PROFILE USER", $scope.user)
	$scope.compositions = allCompositions;

	$scope.followUser = function(userId){
		UserFactory.followUser(userId)

	}

	$scope.addLoop = function(loopId){
		UserFactory.add(loopId)
	}
})

app.config(function($stateProvider){
	$stateProvider.state('profile', {
		url:'/user/:userId',
		templateUrl: '/js/user/public/user.html',
		controller: 'UserPubCtrl',
		resolve: {
			theUser: function(UserFactory, $stateParams){
				return UserFactory.fetchById($stateParams.userId);
			},
			allCompositions: function(CompositionFactory, $stateParams){
				return CompositionFactory.getByCreator($stateParams.userId);
			},
			allFollowers: function(UserFactory, $stateParams){
				return UserFactory.getFollowers($stateParams.userId);
			}
		}
	})

	//implement this state if we want separate compositions page view for specific users 

	// $stateProvider.state('userCompositions',{
	 //    url: '/user/:userid/compositions',
	 //    templateUrl: '/js/compositions/compositions.view.html'
  	// })
})