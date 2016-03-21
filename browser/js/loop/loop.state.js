app.config(function ($stateProvider) {
    $stateProvider.state('loop', {
        url: '/loop',
        controller: 'LoopController',
        templateUrl: 'js/loop/loop.html'
      }
    })
    .state('loops', {
      url: '/loops',
      templateUrl: 'js/loop/loops.html'
    })

});