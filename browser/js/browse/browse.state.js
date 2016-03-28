app.config( function ($stateProvider) {
  $stateProvider
	  .state('browse',{
	    url: '/browse',
	    templateUrl: '/js/browse/browse.html',
	    controller: 'BrowseCtrl',
	    resolve: {
	      allMixes: function(MixFactory){
	      	return MixFactory.getAll();
	      },
	      allLoops: function(LoopFactory){
	      	return LoopFactory.getAll();
	      }
	    }
	})
})
