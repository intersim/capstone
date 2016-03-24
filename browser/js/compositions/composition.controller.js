// app.controller('CompositionCtrl', function(composition) {
//   $scope.composition = composition;
// });

app.controller('CompositionEditor', function($scope, composition, CompositionFactory){
  // $scope.composition = composition;

  $scope.composition = composition;

  $scope.loopBucket = [ 
    {
      _id:"56f16f274852b8ef37d15429",
      name: "loop1",
      notes: [
                {"pitch":"b4","duration":"8n","startTime":"0:1:0", _id: "56f16f274852b8ef37d1542e"},
                {"pitch":"a4","duration":"8n","startTime":"0:2:0", _id: "56f16f274852b8ef37d1542d"},
                {"pitch":"b4","duration":"8n","startTime":"0:3:2", _id: "56f16f274852b8ef37d1542c"},
                {"pitch":"b4","duration":"8n","startTime":"0:0:2", _id: "56f16f274852b8ef37d1542b"},
                {"pitch":"g4","duration":"8n","startTime":"0:2:2", _id: "56f16f274852b8ef37d1542a"}
             ]
    },
    {
      _id:"56f16f2e4852b8ef37d1542f",
      name: "loop2",
      notes: [
                {"pitch":"b4","duration":"8n","startTime":"0:1:0", _id: "56f16f274852b8ef37d1542e"},
                {"pitch":"a4","duration":"8n","startTime":"0:2:0", _id: "56f16f274852b8ef37d1542d"},
                {"pitch":"b4","duration":"8n","startTime":"0:3:2", _id: "56f16f274852b8ef37d1542c"},
                {"pitch":"b4","duration":"8n","startTime":"0:0:2", _id: "56f16f274852b8ef37d1542b"},
                {"pitch":"g4","duration":"8n","startTime":"0:2:2", _id: "56f16f274852b8ef37d1542a"}
             ]
    }
  ]

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
	$scope.composition = {creator: "Clyde", title: "Bonnie", description: "dope tunes to cause havoc to", tags: ['nice'], tracks: [[], []]}
  	$scope.comments = CompositionFactory.getCommentsById($scope.composition._id);
	// $scope.composition = composition;

})