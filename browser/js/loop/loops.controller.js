'use strict';

app.controller('LoopsCtrl', function($scope, loops){

  $scope.loops = loops;

  $scope.sortTypes = ['Popularity', 'Date Created', 'Name'];

  $scope.filterTypes = [
    {name: 'category', values: [
      ]
    }
  ];

})