'use strict';

app.controller('UserPubCtrl', function($scope, $state, theUser, allFollowers, allMixes, UserFactory){
	
	$scope.followers = allFollowers;
	$scope.user = theUser;
	$scope.mixes = allMixes;
	$scope.loops = [];
	var lbucket = $scope.user.bucket;

	for(var i=0; i<lbucket.length; i++){
		console.log(lbucket)
		if(lbucket[i].creator===$scope.user._id && lbucket[i].isPublic) $scope.loops.push(lbucket[i])
	}
    
    UserFactory.following($scope.user._id)
    .then(function(value){
    	$scope.follow=value;
    	if(value) $scope.status="Unfollow"
    	else $scope.status="Follow"
    })

    $scope.change = function(userId){

        if($scope.follow){
            unfollow(userId)
        } else {
            follow(userId)
        }
        $scope.follow=!$scope.follow;
        $scope.status="Unfollow"
    }

    function follow(userId){
    	UserFactory.followUser(userId)
	}

	function unfollow(userId){
    	UserFactory.unfollowUser(userId)
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
			allMixes: function(UserFactory, $stateParams){
				return UserFactory.getMixes($stateParams.userId);
			},
			allFollowers: function(UserFactory, $stateParams){
				return UserFactory.getFollowers($stateParams.userId);
			}
		}
	})


	//GET PROPER LOOPS THROUGH USER ROUTES TO RESOLVE


	//implement this state if we want separate mixes page view for specific users 

	// $stateProvider.state('userMixes',{
	 //    url: '/user/:userid/mixes',
	 //    templateUrl: '/js/mixes/mixes.view.html'
  	// })
})