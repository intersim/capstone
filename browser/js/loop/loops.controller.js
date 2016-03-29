'use strict';

app.controller('LoopsCtrl', function($scope, loops, LoopFactory){

  $scope.loops = loops;
  console.log(loops);

  $scope.selectedSortMethod = 'numUses';
  $scope.selectedFilterMethod = null;

  $scope.sortMethods = [
    {
      name: 'Popularity',
      value: 'numUses'
    },
    {
      name: 'Date Created',
      value: 'dateCreated',
    },
    {
      name: 'Name',
      value: 'name'
    }
  ];

  $scope.filterMethods = [
    {
      name: 'category',
      values: ['Melody', 'Chord', 'Rhythm']
    }
  ];

  $scope.sortLoops = function(sortMethod) {
    $scope.selectedSortMethod = sortMethod;
  }

  $scope.filterLoops = function(filterMethod) {
    $scope.selectedFilterMethod = filterMethod;
  }

  $scope.select = function(loop) {
    LoopFactory.getMixes(loop._id)
    .then(function(mixes) {
      loop.mixes = mixes;
      $scope.selected = loop;
    })

  }
  


})