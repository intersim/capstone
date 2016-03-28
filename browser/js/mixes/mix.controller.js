// app.controller('MixCtrl', function(mix) {
//   $scope.mix = mix;
// });

app.controller('MixEditor', function($scope, mix, MixFactory, $http, loopBucket){
  $scope.mix = mix;

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

  $scope.save = MixFactory.save;

});

app.controller('CompViewCtrl', function($scope, MixFactory){
	$scope.mix = {
    creator: "Clyde", 
    title: "Bonnie", 
    description: "dope tunes to cause havoc to", 
    tags: ['nice'], 
    tracks: [ [], [] ]
  }
  	$scope.comments = MixFactory.getComments();
	// $scope.mix = mix;

})