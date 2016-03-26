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
  $stateProvider.state('createComposition', {
    url: '/composition/new',
    templateUrl: '/js/compositions/composition.edit.html',
    controller: 'CompositionEditor',
    resolve: {
      composition: function(CompositionFactory) {
        return CompositionFactory.new()
      }
    }
  })
  .state('editComposition', {
    url: '/composition/:compositionId',
    templateUrl: '/js/compositions/composition.edit.html',
    controller: 'CompositionEditor',
    resolve: {
      composition: function(CompositionFactory, $stateParams) {
        return CompositionFactory.getById($stateParams.compositionId);
      }
    }
  })
  .state('composition',{
    url: '/finalComposition',
    templateUrl: '/js/compositions/composition.view.html',
    controller: 'CompViewCtrl'
  })


});