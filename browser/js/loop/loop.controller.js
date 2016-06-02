app.controller('LoopController', function ($scope, LoopFactory, LoopCanvas, loop, SamplerFactory, AuthService, $uibModal) {

  LoopFactory.init();
  LoopCanvas.init();
  LoopCanvas.initAnimation();

  // SamplerFactory.test();
  $scope.loop = loop;

  if (loop) {
    loop.notes.forEach(LoopCanvas.draw)
  }

  AuthService.getLoggedInUser()
  .then(function(user) {
    if (!loop || user._id === loop.creator._id){
      $scope.loopBelongsToUser = true;
    } else {
      $scope.loopBelongsToUser = false;
    }
  })

  $scope.open = function () {
    var detailsModal = $uibModal.open({
    animation: true,
    templateUrl: "/js/loop/loop.modal.html",
    scope: $scope,
    size: "lg"
    })
  }

  var helpModal;
  $scope.showHelp = function() {
    helpModal = $uibModal.open({
      animation: true,
      templateUrl: '/js/loop/loop.help.html',
      scope: $scope,
      size: "lg"
    })
  }
  $scope.closeHelp = function() {
    helpModal.close();
  }

  $scope.copyLoop = function(meta) {
    if(!meta) LoopFactory.save(true)
    var arr=[];
    if (meta.tags){
      meta.tags.split(',').forEach(function(tag){arr.push(tag.trim())})
      meta.tags = arr;
    }
    LoopFactory.save(true, meta)

  }

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

  // $scope.loops = allLoops;

  $scope.deleteSelected = LoopFactory.deleteNote;
  
  $scope.saveLoop = function(meta){
    if(!meta) {LoopFactory.save(false)}
    else {var arr=[];
      if(meta.tags){
        meta.tags.split(',').forEach(function(tag){arr.push(tag.trim())})
        meta.tags = arr;
      }
      LoopFactory.save(false, meta)
    }
    
  }

});