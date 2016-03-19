app.config(function($stateProvider) {
  $stateProvider.state('loopEditor', {
    url: '/loopEditor',
    templateUrl: 'js/loops/loop.edit.html',
    controller: 'LoopEditor'
  })
})

app.controller('LoopEditor', function($scope) {
  var width = 320;
  var height = 140;
  var padding = 40;
  var cellWidth = width + (p*2) + 1;
  var cellHeight = height + (p*2) + 1;

  var canvas = document.getElementById("loopGrid");
  var ctx = canvas.getContext("2d");

  function drawBoard(){
    for (var x = 0; x <= width; x += 10) {
        ctx.moveTo(0.5 + x + padding, padding);
        ctx.lineTo(0.5 + x + padding, height + padding);
    }
    for (var x = 0; x <= height; x += 10) {
        ctx.moveTo(padding, 0.5 + x + padding);
        ctx.lineTo(width + padding, 0.5 + x + padding);
    }
    ctx.strokeStyle = "black";
    ctx.stroke();
  }
  drawBoard();
})