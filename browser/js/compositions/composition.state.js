app.config( function ($stateProvider) {
  // $stateProvider.state('composition', {
  //   url: '/composition/:compositionId',
  //   templateUrl: '/js/compositions/composition.html',
  //   resolve: {
  //     composition: function(CompositionFactory, $stateParams) {
  //       return CompositionFactory.getById($stateParams.compositionId, true);
  //     }
  //   },
  //   controller: 'CompositionCtrl'
  // })
  $stateProvider
  .state('editComposition', {
    url: '/composition/:compositionId',
    templateUrl: '/js/compositions/composition.edit.html',
    controller: 'CompositionEditor',
    resolve: {
      getcomposition: function(CompositionFactory, $stateParams) {
        console.log('about to resolve some shit')
        if ( $stateParams.compositionId === 'new') return CompositionFactory.new();
        return CompositionFactory.getById($stateParams.compositionId, true);
      }
    }
  })
  .state('composition',{
    url: '/finalComposition',
    templateUrl: '/js/compositions/composition.view.html',
    controller: 'CompViewCtrl'
  })


});