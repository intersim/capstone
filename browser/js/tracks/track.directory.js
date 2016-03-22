app.directive("track", function() {
  return {
    restrict: 'E',
    scope: {
      contents: "="
    }
    templateUrl: '/js/tracks/track.html',
    link: function(scope) {

    }
  }
})