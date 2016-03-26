app.factory('UserFactory', function($http) {

  var UserFactory = {};

  UserFactory.create = function(newUser){
    return $http.post('/api/users/', newUser)
    .then(response => response.data);
  }

  UserFactory.fetchById = function(uid){
  	var url = 'api/users/'+uid
  	return $http.get(url)
  	.then(response => response.data)
  }

  UserFactory.getFollowers = function(uid){
  	var url = '/api/users/'+uid+'/followers'
  	return $http.get(url)
  	.then(response => response.data);
  }

  //write backend
  //follow a user; fid is the id of the followee
  UserFactory.follow = function(fid){
  	var url = '/api/users/follow/' +fid
  	return $http.put(url)
  	.then(response => response.data)
  }
  //add loop to bucket
  UserFactory.add = function(lid){
  	var url = '/api/users/addloop/'+lid
  	return $http.put(url)
  	.then(response => response.data)
  }

  return UserFactory;

 });