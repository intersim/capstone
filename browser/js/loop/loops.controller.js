'use strict';

app.controller('LoopsCtrl', function($scope, loops, LoopFactory){

  $scope.loops = loops;

  $scope.selectedSortMethod = 'numUses';
  $scope.selectedFilterMethod = null;

  $scope.sortMethods = [
    {
      name: 'Popularity',
      value: function(loop) {
        return loop.mixes.length;
      },
      reverse: true
    },
    {
      name: 'Date Created',
      value: 'dateCreated',
      reverse: true
    },
    {
      name: 'Name',
      value: 'name',
      reverse: false
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
    $scope.selected = loop;
  }  


})