app.controller('LoopController', function ($scope, LoopFactory, loop) {

  LoopFactory.initialize();

  if (loop) LoopFactory.drawLoop(loop);

  $scope.playing = false;

  $scope.toggle = function() {
    if ($scope.playing) {
      Tone.Transport.stop();
      $scope.playing = false;
    } else {
      Tone.Transport.start();
      $scope.playing = true;
    }
  }

  $scope.deleteSelected = LoopFactory.deleteNote;

  $scope.saveLoop = LoopFactory.save;
});