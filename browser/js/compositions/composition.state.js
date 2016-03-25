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
  $stateProvider.state('editComposition', {
    url: '/composition',
    templateUrl: '/js/compositions/composition.edit.html',
    controller: 'CompositionEditor'
  })

  $stateProvider.state('Composition',{
    url: '/finalComposition',
    templateUrl: '/js/compositions/composition.view.html',
    controller: 'CompViewCtrl'
  })

  $stateProvider.state('compositions',{
    url: '/compositions/:id',
    templateUrl: '/js/compositions/compositions.view.html',
    controller: 'CompViewCtrl'
  })

})