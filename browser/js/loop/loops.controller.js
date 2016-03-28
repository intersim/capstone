'use strict';

app.controller('LoopsCtrl', function($scope, loops, LoopFactory){

  $scope.loops = loops;

  $scope.sortTypes = ['Popularity', 'Date Created', 'Name'];

  $scope.filterTypes = [
    {
      name: 'category',
      values:['Melody', 'Chord', 'Rhythm'  ]
    }
  ];

  $scope.select = function(loop) {
    LoopFactory.getMixes(loop._id)
    .then(function(mixes) {
      loop.mixes = mixes;
      $scope.selected = loop;
    })
  }

})