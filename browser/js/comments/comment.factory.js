app.factory('CommentFactory', function($http) {
  return {

    postComment: function(commentData){
    	return $http.post('/api/comments/', comment)
    	.then(function(res){
    		console.log('front end comment', res.data)
    		return res.data
    	})
    }
    
  }
})