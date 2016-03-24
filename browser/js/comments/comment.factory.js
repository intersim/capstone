app.factory('CommentFactory', function($http) {
  return {

    postComment: function(comment){
    	return $http.post('/api/comments/', comment)
    	.then(function(res){
    		console.log('front end comment', res.data)
    		return res.data
    	})
    }
    
  }
})