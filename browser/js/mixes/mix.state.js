app.config( function ($stateProvider) {
  $stateProvider
  .state('editMix', {
    url: '/mix/:mixId',
    templateUrl: '/js/mixes/mix.edit.html',
    controller: 'MixEditor',
    resolve: {
      mix: function(MixFactory, $stateParams) {
        if ($stateParams.mixId==="new") return MixFactory.new();
        return MixFactory.getById($stateParams.mixId, true);
      },
      loopBucket: function (UserFactory, AuthService, LoopFactory) {
          // return AuthService.isAuthenticated() ? UserFactory.getLoopBucket() : LoopFactory.getAll();
        return UserFactory.getLoopBucket();
      }
    }
  })
  //WIRE UP WHEN WE CAN SAVE MIXES
  .state('mix',{
    url: '/finalMix/',
    templateUrl: '/js/mixes/mix.view.html',
    controller: 'MixViewCtrl'
    // resolve: {mix: function(mixId){}}
  })
  .state('mixes', {
    url: '/mixes',
    templateUrl: '/js/mixes/mixes.view.html',
    controller: 'MixesCtrl',
    resolve: {
      mixes: function($http, MixFactory) {
        return MixFactory.getAll();
      }
    }
  })
});