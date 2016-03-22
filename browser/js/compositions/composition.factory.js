app.factory('CompositionFactory', function($http) {
  return {
    getById: function(compositionId, includeTracks) {
      var uri = '/api/compositions/' + compositionId;
      if (includeTracks) uri += "?includeTracks=true";
      return $http.get(url).then(function(res) { return res.data; });
    }
  }
})