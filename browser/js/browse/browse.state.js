app.config( function ($stateProvider) {
  $stateProvider
	  .state('browse',{
	    url: '/browse',
	    templateUrl: '/js/browse/browse.html',
	    controller: 'BrowseCtrl',
	    resolve: {
	      allCompositions: function(CompositionFactory){
	      	return CompositionFactory.getAll();
	      },
	      allLoops: function(LoopFactory){
	      	return LoopFactory.getAll();
	      }
	    }
	})
})
