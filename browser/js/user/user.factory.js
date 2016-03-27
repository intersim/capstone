app.factory('UserFactory', function($http, AuthService) {

  var UserFactory = {};

  UserFactory.create = function(newUser){
    return $http.post('/api/users/', newUser)
    .then(response => response.data);
  }

  UserFactory.fetchById = function(userId){
  	var url = 'api/users/'+userId
  	return $http.get(url)
  	.then(response => response.data)
  }

  UserFactory.getFollowers = function(userId){
  	var url = '/api/users/'+userId+'/followers'
  	return $http.get(url)
  	.then(response => response.data);
  }

  //follow user; userId is the id of the followee
  UserFactory.followUser = function(userId){
  	
    return AuthService.getLoggedInUser()
    .then(function(currentUser){
      console.log('curr user', currentUser)
      var url = "/api/users/" + currentUser._id
      if (currentUser.following.indexOf(userId)!==-1 || currentUser._id===userId) return currentUser;
      currentUser.following.push(userId)
      return $http.put(url, currentUser)
      .then(response => response.data)
    })
  }
  //add loop to bucket
  UserFactory.addLoop = function(loopId){

    return AuthService.getLoggedInUser()
    .then(function(currentUser){
      var url = "/api/users/" + currentUser._id
      if (currentUser.bucket.indexOf(loopId)!==-1) return currentUser;
      currentUser.bucket.push(loopId)
      return $http.put(url, currentUser)
      .then(response => response.data)
    })
  }

  UserFactory.getCompositions = function(userId) {
    return $http.get('/api/users/' + userId + '/compositions')
      .then(function(res) {
        return res.data;
      })
  }

  return UserFactory;

 });