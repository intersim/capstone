app.controller('LoopController', function ($scope, LoopFactory, loop, SamplerFactory, AuthService, $uibModal) {

  LoopFactory.initialize();
  // SamplerFactory.test();
  $scope.loop = loop;

  if (loop) LoopFactory.drawLoop(loop);

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

  // var piano = new Tone.PolySynth(8, Tone.Sampler, {
  //     A : {
  //         4 : "./piano/piano.A4.ogg"
  //         },
  //     B : {
  //         4 : "./piano/piano.B4.ogg"
  //         },
  //     C : {
  //         4 : "./piano/piano.C4.ogg",
  //         5 : "./piano/piano.C5.ogg"
  //         },
  //     D : {
  //         4 : "./piano/piano.D4.ogg"
  //         },
  //     E : {
  //         4 : "./piano/piano.E4.ogg"
  //         },
  //     F : {
  //       4 : "./piano/piano.F4.ogg"
  //         },
  //     G : {
  //         4 : "./piano/piano.G4.ogg",
  //         }
  //     }).toMaster();

  // Tone.Transport.bpm.rampTo(90);

  // Tone.Buffer.on('load', function () {
  //     console.log('audio buffers have loaded!');
  //     piano.triggerAttack(['C.4', 'E.4', 'G.4']);
  // });

  // Tone.Transport.schedule(function(){
  //   piano.triggerAttack('C.4');
  // }, '0:0:0');

  // Tone.Transport.schedule(function(){
  //   piano.triggerAttack('D.4');
  // }, '0:0:2');

  // Tone.Transport.schedule(function(){
  //   piano.triggerAttack('E.4');
  // }, '0:1:0');

  // Tone.Transport.schedule(function(){
  //   piano.triggerAttack('F.4');
  // }, '0:1:2');

  // Tone.Transport.schedule(function(){
  //   piano.triggerAttack('G.4');
  // }, '0:2:0');

});