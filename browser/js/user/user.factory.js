app.factory('UserFactory', function($http, AuthService) {

  var UserFactory = {};

  UserFactory.getAll = function() {
    return $http.get('/api/users/')
      .then(function(res) {
        return res.data;
      })
  }

  UserFactory.create = function(userData){
    return $http.post('/api/users/', userData)
      .then(response => response.data);
  }

  UserFactory.fetchById = function(userId){
  	var url = '/api/users/' + userId
  	return $http.get(url)
  	.then(response => response.data)
  }

  UserFactory.getFollowers = function(userId){
  	var url = '/api/users/' + userId + '/followers'
  	return $http.get(url)
  	.then(response => response.data);
  }

  //follow user; userId is the id of the followee
  UserFactory.followUser = function(userId){
  	
    return AuthService.getLoggedInUser()
    .then(function(currentUser){
      var url = "/api/users/" + currentUser._id;
      if (currentUser.following.indexOf(userId)!==-1 || currentUser._id===userId) return currentUser;
      currentUser.following.push(userId)
      return $http.put(url, currentUser)
      .then(response => response.data)
    })
  }

  //unfollow user; userId is the id of the followee
    UserFactory.unfollowUser = function(userId){
    return AuthService.getLoggedInUser()
    .then(function(currentUser){
      var url = "/api/users/" + currentUser._id;
      var index = currentUser.following.indexOf(userId);
      currentUser.following.splice(index, 1)
      return $http.put(url, currentUser)
      .then(response => response.data)
    })
  }

  //add loop to bucket
  UserFactory.addToBucket = function(loop){
    console.log('add bucket')
    return AuthService.getLoggedInUser()
    .then(function(currentUser){
      var url = "/api/users/" + currentUser._id
      if (currentUser.bucket.indexOf(loop._id)!==-1) return currentUser;
      currentUser.bucket.push(loop._id)
      return $http.put(url, currentUser)
      .then(response => response.data)
    })
  }

  //removes loop from bucket
  UserFactory.removeFromBucket = function(loop){
    console.log('remove from bucket', loop)
    return AuthService.getLoggedInUser()
    .then(function(currentUser){
      var url = "/api/users/" + currentUser._id
      var index = currentUser.bucket.indexOf(loop._id)
      console.log("loop bucket", currentUser.bucket)
      console.log("index", index)
      currentUser.bucket.splice(index, 1)
      return $http.put(url, currentUser)
      .then(response => response.data)
    })
  }

  UserFactory.getMixes = function(userId) {
    return $http.get('/api/users/' + userId + '/mixes')
      .then(function(res) {
        return res.data;
      })
  }

  UserFactory.getLoops = function(userId) {
    return $http.get('/api/users/' + userId + '/loops')
      .then(function(res) {
        return res.data;
      })
  }


  UserFactory.getLoopBucket = function() {
    return AuthService.getLoggedInUser()
    .then(function (currentUser) {
      return $http.get("/api/users/" + currentUser._id + "/loopBucket")
    })
    .then(function(res) {
      return res.data;
    })
  }

  //favorite a mix
  UserFactory.favorite = function(mixId){
    return AuthService.getLoggedInUser()
    .then(function(currentUser){
      currentUser.favorites.push(mixId) 
    return $http.put('/api/users/' + currentUser._id, currentUser)
    .then(response => response.data)
    })   
  }

  //unfavorite a mix
  UserFactory.unfavorite = function(mixId){
    return AuthService.getLoggedInUser()
    .then(function(currentUser){
      var index = currentUser.favorites.indexOf(mixId)
      currentUser.favorites.splice(index, 1) 
    return $http.put('/api/users/' + currentUser._id, currentUser)
    .then(response => response.data)
    })   
  }

  return UserFactory;

 });