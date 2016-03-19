app.directive("canvasGrid", function(CanvasGrid) {
  return {
    restrict: "A",
    scope: {
      width: "@",
      height: "@"
    },
    link: function(scope, element) {
      console.log(element);
      var canvas = element[0];
      var grid = new CanvasGrid.constructor(canvas, {
        borderColor: '#777'
      });

      var activeColor = '#ff0beb';

      grid.drawMatrix({
        x: 32,
        y: 16
      });

      canvas.addEventListener('click', function(event) {
        if (event.gridInfo.color.hex !== activeColor) {
          grid.fillCell(event.gridInfo.x, event.gridInfo.y, activeColor);
        } else {
          grid.clearCell(event.gridInfo.x, event.gridInfo.y);
        }
      });
    }
  }
})