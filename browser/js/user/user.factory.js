app.factory('UserFactory', function($http) {

  var UserFactory = {};

  UserFactory.create = function(newUser){
    return $http.post('/api/users/', newUser)
    .then(response => response.data);
  }

  UserFactory.theUser = function(uid){
  	return $http.get('/api/users/', uid)
  	.then(response => response.data);
  }

  UserFactory.getFollowers = function(uid){
  	var url = '/api/users/'+uid+'/followers'
  	return $http.get(url)
  	.then(response => response.data);
  }


  return UserFactory;

 });