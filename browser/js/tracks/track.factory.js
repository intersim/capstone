app.factory('TrackFactory', function($http) {
  return {
    get: function(trackId) {
      return $http.get('api/tracks/' + trackId).then(function(res) { return res.data });
    }
  }
})