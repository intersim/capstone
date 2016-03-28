app.config(function ($stateProvider) {

    $stateProvider.state('loop', {
        url: '/loop/:loopId',
        controller: 'LoopController',
        templateUrl: 'js/loop/loop.html',
        resolve: {
          loop: function($http, $stateParams) {
            if ($stateParams.loopId !== "new") {
              return $http.get('/api/loops/' + $stateParams.loopId)
              .then(function(res) {
                return res.data;
              })
            } else return;
          }
        }
    })
    .state('loops', {
      url: '/loops',
      templateUrl: 'js/loop/loops.view.html',
      controller: 'LoopsCtrl',
      resolve: {
        loops: function($http) {
          return $http.get('/api/loops')
            .then(function(res) {
              return res.data;
            })
        }
      }
    })

});