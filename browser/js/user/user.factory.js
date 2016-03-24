app.factory('UserFactory', function($http) {

  var UserFactory = {};

    UserFactory.create = function(newUser){
    return $http.post('/api/users/', newUser)
    .then(response => response.data);
  };

  return UserFactory;

 })