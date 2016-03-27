'use strict';

app.controller('UserPubCtrl', function($scope, $state, theUser, allFollowers, allCompositions, UserFactory){
	
	$scope.followers = allFollowers;
	$scope.user = theUser;
	$scope.compositions = allCompositions;
	$scope.loops = [];
	var lbucket = $scope.user.bucket;

	for(var i=0; i<lbucket.length; i++){
		console.log(lbucket)
		if(lbucket[i].creator===$scope.user._id && lbucket[i].isPublic) $scope.loops.push(lbucket[i])
	}

	$scope.followUser = function(userId){
		UserFactory.followUser(userId)
	}

	$scope.favorite = function(compositionId){
		UserFactory.favorite(compositionId)
	}

	$scope.addLoop = function(loopId){
		UserFactory.addLoop(loopId)
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
			allCompositions: function(UserFactory, $stateParams){
				return UserFactory.getCompositions($stateParams.userId);
			},
			allFollowers: function(UserFactory, $stateParams){
				return UserFactory.getFollowers($stateParams.userId);
			}
		}
	})


	//GET PROPER LOOPS THROUGH USER ROUTES TO RESOLVE


	//implement this state if we want separate compositions page view for specific users 

	// $stateProvider.state('userCompositions',{
	 //    url: '/user/:userid/compositions',
	 //    templateUrl: '/js/compositions/compositions.view.html'
  	// })
})