app.config( function ($stateProvider) {
  $stateProvider
	  .state('browse',{
	    url: '/browse',
	    templateUrl: '/js/browse/browse.html',
	    controller: 'BrowseCtrl',
	    resolve: {
	      mtype: function(MixFactory, LoopFactory, $stateParams){
	      	if($stateParams.kind==="mixes") return MixFactory.getAll();
	      	return LoopFactory.getAll();
	      }
	    }
	})
})
