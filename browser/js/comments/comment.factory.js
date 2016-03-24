app.factory('CommentFactory', function($http) {
  return {
  	//returns an array of objects
    getCommentsById: function(targetId) {
      var uri = '/api/comments/' + targetId;
      return $http.get(uri).then(function(res) { return res.data; });
    }
    
  }
})