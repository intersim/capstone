// app.controller('CompositionCtrl', function(composition) {
//   $scope.composition = composition;
// });

app.controller('CompositionEditor', function($scope, getcomposition, CompositionFactory, $http){
  // $scope.composition = composition;
  console.log('we are in composition editor controller')
  $scope.composition = getcomposition;

  $http.get('/api/loops/')
  .then(function(res){
    return res.data;
  })
  .then(function(loops){
    $scope.loopBucket = loops;
  })

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
  console.log("this is scope save", $scope.save)

});

app.controller('CompViewCtrl', function($scope, CompositionFactory){
	$scope.composition = {creator: "Clyde", title: "Bonnie", description: "dope tunes to cause havoc to", tags: ['nice'], tracks: [[], []]}
  	$scope.comments = CompositionFactory.getCommentsById($scope.composition._id);
	// $scope.composition = composition;

})