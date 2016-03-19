var canvas = new fabric.Canvas('c', { selection: false });
var grid = 40;

// create grid

for (var i = 0; i < (600 / grid); i++) {
  canvas.add(new fabric.Line([ i * grid, 0, i * grid, 600], { stroke: '#ccc', selectable: false }));
  canvas.add(new fabric.Line([ 0, i * grid, 600, i * grid], { stroke: '#ccc', selectable: false }))
}

canvas.add(new fabric.Rect({ 
  left: 100, 
  top: 100, 
  width: 50, 
  height: 50, 
  fill: '#faa', 
  originX: 'left', 
  originY: 'top',
  centeredRotation: true
}));

// function getMousePos(canvas, evt) {
//     var rect = canvas.getBoundingClientRect();
//     return {
//       x: evt.clientX - rect.left,
//       y: evt.clientY - rect.top
//     };
// }

// add objects on click?
// add new rectangles on grid
canvas.on('mousedown', function() {
  // console.log mouse location on mousedown?
})

// want them to only show middle-left controls and middle right-controls
function observeBoolean(property) {
  document.getElementById(property).onclick = function() {
    canvas.item(0)[property] = this.checked;
    canvas.renderAll();
  };
};

// the below function is throwing off the snap to grid function...
// observeOptionsList('setControlVisible');

// snap to grid, but only when moving (not when resizing yet):
canvas.on('object:moving', function(options) { 
  options.target.set({
    left: Math.round(options.target.left / grid) * grid,
    top: Math.round(options.target.top / grid) * grid
  });
});