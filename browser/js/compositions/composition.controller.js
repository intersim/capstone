// app.controller('CompositionCtrl', function(composition) {
//   $scope.composition = composition;
// });

app.controller('CompositionEditor', function($scope, composition, CompositionFactory, $http, loopBucket){
  $scope.composition = composition;

  $scope.loopBucket = loopBucket;

  $scope.playing = false;
  
  $scope.togglePlay = function() {
    if ($scope.playing) {
      Tone.Transport.stop();
      $scope.playing = false;
    } else {
      Tone.Transport.start();
      $scope.playing = true;
    }
  }

  $scope.save = CompositionFactory.save;

});

app.controller('CompViewCtrl', function($scope, CompositionFactory){
	$scope.composition = {
    creator: "Clyde", 
    title: "Bonnie", 
    description: "dope tunes to cause havoc to", 
    tags: ['nice'], 
    tracks: [ [], [] ]
  }
  	$scope.comments = CompositionFactory.getCommentsById($scope.composition._id);
	// $scope.composition = composition;

})