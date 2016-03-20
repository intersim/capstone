var canvas = new fabric.Canvas('c', { selection: false });
var grid = 40;

// create grid

for (var i = 0; i < (600 / grid); i++) {
  canvas.add(new fabric.Line([ i * grid, 0, i * grid, 600], { stroke: '#ccc', selectable: false }));
  canvas.add(new fabric.Line([ 0, i * grid, 600, i * grid], { stroke: '#ccc', selectable: false }))
}

var rect = new fabric.Rect({ 
  left: 40, 
  top: 40, 
  width: 40, 
  height: 40, 
  fill: '#faa', 
  originX: 'left', 
  originY: 'top',
  centeredRotation: true,
  lockScalingY: true,
  lockRotation: true,
  lockScalingFlip: true,
  rx: 10,
  ry: 10
});

//add double-click listener?
// getCenterPoint()
// hoverCursor - show note?

// want them to only show middle-left controls and middle right-controls
// function observeBoolean(property) {
//   document.getElementById(property).onclick = function() {
//     canvas.item(0)[property] = this.checked;
//     canvas.renderAll();
//   };
// };

// the below function is throwing off the snap to grid function...
// observeOptionsList('setControlVisible');

// snap to grid, but only when moving (not when resizing yet):
canvas.on('object:moving', function(options) { 
  options.target.set({
    left: Math.round(options.target.left / grid) * grid,
    top: Math.round(options.target.top / grid) * grid
  });
});

// scale only in grid increments?
canvas.on('object:scaling', function(options) { 
  options.target.set({
    left: Math.round(options.target.left / grid) * grid,
    top: Math.round(options.target.top / grid) * grid,
    // right: Math.round(options.target.right / grid) * grid,
    // bottom: Math.round(options.target.bottom / grid) * grid
  });
});

canvas.on('mouse:down', function(options){
  if (options.target) return;

  console.log('mouse down!');
  canvas.add(new fabric.Rect({ 
      left: options.e.clientX,
      top: options.e.clientY,
      width: 40, 
      height: 40, 
      fill: '#faa', 
      originX: 'left', 
      originY: 'top',
      centeredRotation: true,
      lockScalingY: true,
      lockRotation: true,
      lockScalingFlip: true,
    })
  );
  console.log(options.e.clientX, options.e.clientY);
});

$('#delete').click(function () {
  canvas.getActiveObject().remove();
});