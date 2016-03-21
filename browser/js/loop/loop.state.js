app.config(function ($stateProvider) {

    $stateProvider.state('loop', {
        url: '/loop',
        controller: 'LoopController',
        templateUrl: 'js/loop/loop.html',
        resolve: {
          loop: function($http) {
            return $http.get('/api/loops/56f06287921942a929699b10')
            .then(function(res) {
              console.log(res);
              return res.data;
            })
          }
        }
    })
    .state('loops', {
      url: '/loops',
      templateUrl: 'js/loop/loops.html'
    })

});