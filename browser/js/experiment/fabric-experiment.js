// initialize instrument
var synth = new Tone.SimpleSynth().toMaster();

// initialize canvas for a 8 * 8 grid
var canvas = new fabric.Canvas('c', { 
    selection: false
  });
canvas.setHeight(320);
canvas.setWidth(320);
canvas.renderAll();
var grid = 40;


// draw lines on grid
for (var i = 0; i < (320 / grid); i++) {
  canvas.add(new fabric.Line([ i * grid, 0, i * grid, 320], { stroke: '#ccc', selectable: false }));
  canvas.add(new fabric.Line([ 0, i * grid, 320, i * grid], { stroke: '#ccc', selectable: false }))
}

// snap to grid, but only when moving (not when resizing objs yet):
canvas.on('object:moving', function(options) {
  options.target.set({
    left: Math.round(options.target.left / grid) * grid,
    top: Math.round(options.target.top / grid) * grid
  });
});

var lastObjId = 16; //first 16 items are the canvas itself and the lines on it

// change this to a double-click event (have to add a listener)?
canvas.on('mouse:down', function(options){
  if (options.target) return;
  var newId = lastObjId++;

  canvas.add(new fabric.Rect({
      id: newId,
      left: options.e.offsetX,
      top: options.e.offsetY,
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

  console.log("offset X&Y: ", options.e.offsetX, options.e.offsetY);
  var newItem = canvas.item(newId);
  canvas.setActiveObject(newItem);

  // sound a tone!
  synth.triggerAttackRelease(getPitchStr(options.e.offsetY), "8n");
  // what beat should it be on?
  console.log("this col's beat: ", getBeatStr(options.e.offsetX));
});

$('#delete').click(function () {
  canvas.getActiveObject().remove();
  lastObjId--;
  //also delete tone event
});

function getPitchStr (yVal) {
  if (yVal >= 0 && yVal < 40) return "c5";
  if (yVal >= 40 && yVal < 80) return "b4";
  if (yVal >= 80 && yVal < 120) return "a4";
  if (yVal >= 120 && yVal < 160) return "g4";
  if (yVal >= 160 && yVal < 200) return "f4";
  if (yVal >= 200 && yVal < 240) return "e4";
  if (yVal >= 240 && yVal < 280) return "d4";
  if (yVal >= 280 && yVal < 320) return "c4";
}

function getBeatStr (xVal) {
  if (xVal >= 0 && xVal < 40) return "0:0:0";
  if (xVal >= 40 && xVal < 80) return "0:0:2";
  if (xVal >= 80 && xVal < 120) return "0:1:0";
  if (xVal >= 120 && xVal < 160) return "0:1:2";
  if (xVal >= 160 && xVal < 200) return "0:2:0";
  if (xVal >= 200 && xVal < 240) return "0:2:2";
  if (xVal >= 240 && xVal < 280) return "0:3:0";
  if (xVal >= 280 && xVal < 320) return "0:3:2";
}

// function getDurationStr (xVal) {
//   // on object resize, get new X value / 4, and then convert that into
//   // then schedule new tone
// }

function scheduleTone (objX, objY) {
  Tone.Transport.schedule(function(){
    synth.triggerAttackRelease(getPitchStr(objY), "8n");
  }, getBeatStr(objX));
}

// make new objects with double-click: add double-click listener
// can set id of selected object and link it to Transport id
// want selected object to only show middle-left controls and middle right-controls
// scale only in grid increments?
// getCenterPoint() - could use to schedule new note on Tone.Transport
// hoverCursor - somehow show note? default is null, I think...
// later: resize the canvas if user wants to create a longer loop?