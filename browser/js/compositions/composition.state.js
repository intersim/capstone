app.config( function ($stateProvider) {
  $stateProvider
  .state('editComposition', {
    url: '/composition/:compositionId',
    templateUrl: '/js/compositions/composition.edit.html',
    controller: 'CompositionEditor',
    resolve: {
      composition: function(CompositionFactory, $stateParams) {
        if (!$stateParams.compositionId) return CompositionFactory.new();
        return CompositionFactory.getById($stateParams.compositionId, true);
      },
      loopBucket: function (UserFactory) {
          return UserFactory.getLoopBucket()
      }
    }
  })
  //WIRE UP WHEN WE CAN SAVE COMPOSITIONS
  .state('composition',{
    url: '/finalComposition/',
    templateUrl: '/js/compositions/composition.view.html',
    controller: 'CompViewCtrl'
    // resolve: {composition: function(compositionId){}}
  })
});