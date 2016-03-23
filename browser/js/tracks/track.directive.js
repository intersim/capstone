app.directive("track", function() {
  return {
    restrict: 'E',
    scope: {
      contents: "="
    },
    templateUrl: '/js/tracks/track.html',
    link: function(scope) {
      scope.addLoop = function() {
        alert('new loop dropped into track');
      }
    }
  }
})