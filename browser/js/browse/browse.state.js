app.config( function ($stateProvider) {
  $stateProvider
	  .state('loopsBrowse',{
	    url: '/browseloops',
	    templateUrl: '/js/browse/loops.html',
	    controller: 'BrowseLoops',
	    resolve: {
	      loops: function(LoopFactory, $stateParams){
	      	return LoopFactory.getAll();
	      }
	    }
	})
	  .state('mixes',{
	  	url:'/browsemixes',
	  	templateUrl: '/js/browse/mixes.html',
	  	controller: 'BrowseMixes',
	  	resolve: {
	  		mixes: function(MixFactory, $stateParams){
	  			return MixFactory.getAll()
	  		}
	  	}
	  })
})
