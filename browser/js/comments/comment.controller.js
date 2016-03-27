app.controller('CommentCtrl', function($scope, CompositionFactory){

  var composition = {creator:"56f1a976ff0f75083fd3a379", title: "What a Jam", description: "an ode to fruit preserves", tags: ['truelove', 'beauty', 'and', 'grace', 'miss','unitedstates'], tracks: [[],[]] }
  
  // var id = $scope.target._id;
  //$scope.comments = CommentFactory.getCommentsById(id);

  $scope.comments = [{author: "56f1a976ff0f75083fd3a37a", content: "Sick Beat Bro", target: composition }, {author: "56f1a976ff0f75083fd3a37a", content: "Love this", target: composition }]

  $scope.sendComment = function(comment, targetid){
  	console.log("passing comment", comment)
  	var body = {"comment": comment.content, "targetId": targetid}
  	CommentFactory.postComment(body)
  }

});