app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('loop', {
        url: '/loop',
        controller: 'LoopController',
        templateUrl: 'js/loop/loop.html'
        }
    });

});