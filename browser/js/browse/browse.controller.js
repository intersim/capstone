'use strict';

app.controller('BrowseCtrl', function($scope, $state, allMixes, allLoops){

	$scope.mixes = allMixes;
	$scope.loops = allLoops;


})