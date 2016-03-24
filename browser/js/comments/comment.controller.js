app.controller('CommentCtrl', function($scope){

  var composition = {creator:"56f1a976ff0f75083fd3a379", title: "What a Jam", description: "an ode to fruit preserves", tags: ['truelove', 'beauty', 'and', 'grace', 'miss','unitedstates'], tracks: [[],[]] }
  
  //$scope.comments = getCommentsById;
  $scope.comments = [{author: "56f1a976ff0f75083fd3a37a", content: "Sick Beat Bro", target: composition }, {author: "56f1a976ff0f75083fd3a37a", content: "Love this", target: composition }]

});