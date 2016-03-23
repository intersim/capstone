// app.controller('CompositionCtrl', function(composition) {
//   $scope.composition = composition;
// });

app.controller('CompositionEditor', function($scope){
  // $scope.composition = composition;
  $scope.composition = {tracks: [[], []]}
  $scope.loopBucket = [ {_id:"56f16f274852b8ef37d15429", name: "loop1"}, {_id:"56f16f2e4852b8ef37d1542f", name: "loop2"} ]
});