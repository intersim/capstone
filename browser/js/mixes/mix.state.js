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
  .state('mix', {
    url: '/finalMix/:mixId',
    templateUrl: '/js/mixes/mix.view.html',
    controller: 'FinalMixCtrl',
    resolve: {
      finalMix: function(MixFactory, $stateParams) {
        return MixFactory.getById($stateParams.mixId, true);
      }
    }
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