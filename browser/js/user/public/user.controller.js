'use strict';

app.controller('UserPubCtrl', function($scope, $state, theUser, allFollowers, allCompositions, UserFactory){
	
	$scope.followers = allFollowers;
	$scope.user = theUser;
	$scope.compositions = allCompositions;

	$scope.follow = function(uid){
		UserFactory.follow(uid)

	}

	$scope.add = function(loop){
		UserFactory.add(loop)
	}
})

app.config(function($stateProvider){
	$stateProvider.state('profile', {
		url:'/user/:userid',
		templateUrl: '/js/user/public/user.html',
		controller: 'UserPubCtrl',
		resolve: {
			theUser: function(UserFactory, $stateParams){
				return UserFactory.fetchById($stateParams.userid);
			},
			allCompositions: function(CompositionFactory, $stateParams){
				return CompositionFactory.getByCreator($stateParams.userid);
			},
			allFollowers: function(UserFactory, $stateParams){
				return UserFactory.getFollowers($stateParams.userid);
			}
		}
	})

	//implement this state if we want separate compositions page view for specific users 

	// $stateProvider.state('userCompositions',{
	 //    url: '/user/:userid/compositions',
	 //    templateUrl: '/js/compositions/compositions.view.html'
  	// })
})