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

      scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i < max; i += step) {
          input.push(i);
        }
        return input;
      }

    }
  }
})