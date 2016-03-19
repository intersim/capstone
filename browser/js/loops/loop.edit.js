app.config(function($stateProvider) {
  $stateProvider.state('loopEditor', {
    url: '/loopEditor',
    templateUrl: 'js/loops/loop.edit.html',
    controller: 'LoopEditor'
  })
})

app.controller('LoopEditor', function($scope) {


})