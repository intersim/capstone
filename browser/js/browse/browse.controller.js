'use strict';

app.controller('BrowseCtrl', function($scope, $state, allCompositions, allLoops){

	$scope.composition = allCompositions;
	$scope.loops = allLoops;


})