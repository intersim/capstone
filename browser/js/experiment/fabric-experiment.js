// initialize instrument
var synth = new Tone.PolySynth(16, Tone.SimpleSynth, {
            "oscillator" : {
                "partials" : [0, 2, 3, 4],
            },
            "volume" : -12
        }).toMaster();

// initialize looping
console.log('V start TT event ID', JSON.stringify(Tone.Transport._eventID))


Tone.Transport.loop = true;
Tone.Transport.loopStart = "0:0:0";
Tone.Transport.loopEnd = "0:4:0";


// intialize Transport event timeline tracking
// var lastEvent = null;

// buttons
$('#stop').hide();

$('#play').click(function () {
  Tone.Transport.start();
  $('#play').hide();
  $('#stop').show();
});

$('#stop').click(function () {
  Tone.Transport.stop();
  $('#play').show();
  $('#stop').hide();
});

$('#delete').click(function () {
  var idC = canvas.getActiveObject().Myid
  canvas.getActiveObject().remove();
  lastObjId--;
  //also delete tone event:
  Tone.Transport.clear(idC);

});

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

// snap to grid when moving obj (doesn't work when resizing):
canvas.on('object:modified', function(options) {
  console.log('OBJECT MODIFIED')
  console.log(options.target.canvas)
  // console.log("options", options)
  // console.log('options target', options.target)

  options.target.set({
    left: Math.round(options.target.left / grid) * grid,
    top: Math.round(options.target.top / grid) * grid
  });

  var idC = canvas.getActiveObject().Myid
  console.log('CANVAS ID', idC)
  console.log('MODIFIED TONE TRANSPORT ID', JSON.stringify(Tone.Transport._eventID))
  //delete old event
  Tone.Transport.clear(idC);
  // lastObjId++;

  console.log("options.target", options.target);
  console.log('DELETED', idC)

  // lastEvent <= 0 ? lastEvent = null : lastEvent--;
  //make new one
  var center = canvas.getActiveObject().getCenterPoint();
  var xVal = Math.ceil(center.x)
  if(xVal < 0) xVal = 0;
  var yVal = Math.ceil(center.y)
  if(yVal < 0) yVal = 0;
  console.log("x: ", xVal, "y: ", yVal)

  // var xVal = Math.floor(options.target.oCoords.mt.x)
  // if(xVal < 0) xVal = 0;
  // var yVal = Math.ceil(options.target.oCoords.tl.y)
  // if(yVal < 0) yVal = 0;
  // console.log("x: ", xVal, "y: ", yVal)
  var newEventId = scheduleTone(xVal, yVal, idC);
  console.log("NxEW EVENT ID: ", newEventId);

  // newIdC = canvas.getActiveObject().set('Myid', idC);
  // console.log("NEW CANVAS ID: ", newIdC);
});

//resizing objects
//doesn't do anything other than ruin my life
// canvas.on('object:modified', function(options) {
//   console.log(options)
//   console.log(options.target)

//   options.target.set({
//     left: Math.round(options.target.left / grid) * grid,
//     right: options.target.oCoords.br.x,
//     top: Math.round(options.target.top / grid) * grid,
//     width: Math.floor((options.target.oCoords.br.x - options.target.oCoords.bl.x) / grid) * 40
//   });
// });


var lastObjId = 15; //first 15 items are the canvas itself and the lines on it

// create a new rectangle obj on mousedown in canvas area
// change this to a double-click event (have to add a listener)?
canvas.on('mouse:down', function(options){
  console.log('MOUSE DOWN')

  if (options.target) {
    synth.triggerAttackRelease(getPitchStr(options.e.offsetY), "8n");
    return;
  }

  var newId = ++lastObjId;
  console.log("0. NEW OBJ ID", newId)
  // console.log("last obj id", lastObjId)


  canvas.add(new fabric.Rect({
      Myid: newId,
      left: Math.floor(options.e.offsetX / 40) * 40,
      right: Math.floor(options.e.offsetX / 40) * 40,
      top: Math.floor(options.e.offsetY / 40) * 40,
      width: 40, 
      height: 40, 
      fill: '#faa', 
      originX: 'left', 
      originY: 'top',
      centeredRotation: true,
      minScaleLimit: 0,
      lockScalingY: true,
      lockScalingFlip: true,
      hasRotatingPoint: false
    })
  );
  console.log('143')
  // var newItem = canvas.item(newId);
  // console.log("new item", newItem, "new id", newId)
  // console.log('145', canvas)
  // canvas.setActiveObject(newItem);

  // console.log('id of new obj: ', JSON.stringify(canvas.getActiveObject().get('id'))); //same as newId

  // sound tone when clicking, and schedule
  console.log('151')
  synth.triggerAttackRelease(getPitchStr(options.e.offsetY), "8n");
  console.log('153')
  var eventId = scheduleTone(options.e.offsetX, options.e.offsetY, newId);

  console.log('2. ID OF THE OBJ TRANSPORT EVENT', eventId);
  // console.log('3. NEW CLICK TRANSPORT', JSON.stringify(Tone.Transport))


  //increment last event for clear button
  // lastEvent === null ? lastEvent = 0 : lastEvent++;
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

function scheduleTone (objX, objY, objId) {
  console.log('SCHEDULE TONE')
  //event id is starting with ZERO
  var pitch = getPitchStr(objY);
  var duration = "8n";
  var startTime = getBeatStr(objX);

  console.log("pitch", pitch);
  console.log("startTime", startTime);



  var eventId = Tone.Transport.schedule(function(){
    synth.triggerAttackRelease(pitch, duration);
  }, startTime, objId);



  // console.log('TRANSPORT AFTER SCHEDULE', JSON.stringify(Tone.Transport._eventID))

  console.log('1. SHOULD BE SAME AS NEXT', eventId)

  return eventId;
}

// function getDurationStr (xVal) {
//   // on object resize, get new X value / 40
//   // convert that into duration string (8n, 4n, etc.)
//   // then schedule new tone
// }


// can set id of selected object and link it to Transport id
// want selected object to only show middle-left controls and middle right-controls
// scale only in grid increments?
// getCenterPoint() - could use to schedule new note on Tone.Transport
// hoverCursor - somehow show note? default is null, I think...
// later: resize the canvas if user wants to create a longer loop?