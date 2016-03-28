'use strict';

app.factory('LoopFactory', function($http, $stateParams, $state){
  var LoopFactory = {};

  var canvas;
  var grid;
  var synth = new Tone.PolySynth(16, Tone.SimpleSynth, {
            "oscillator" : {
                "partials" : [0, 2, 3, 4],
            },
            "volume" : -12
        }).toMaster();
  
  // initialize looping
  Tone.Transport.loop = true;
  Tone.Transport.loopStart = "0:0:0";
  Tone.Transport.loopEnd = "0:4:0";
  
  // intialize Transport event timeline tracking
  var lastObjId = 15;

  var loopMusicData = {};

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

  function getDurationStr (width) {
    if (width === 40) return "8n";
    if (width === 80) return "4n";
    if (width === 120) return "4n+8n";
    if (width === 160) return "2n";
    if (width === 200) return "2n+8n";
    if (width === 240) return "2n+4n";
    if (width === 280) return "2n+4n+8n";
    if (width === 320) return "1n";
  }

  function scheduleTone (objX, objY, width, objectId) {
    var pitch = getPitchStr(objY);
    var duration = getDurationStr(width);
    var startTime = getBeatStr(objX);
    var eventId = Tone.Transport.schedule(function(){
      synth.triggerAttackRelease(pitch, duration);
    }, startTime, objectId);
    loopMusicData[objectId] = {pitch: pitch, duration: duration, startTime: startTime};

    return eventId;
  }

  function getYvals(note) {
    var edges = noteYMap.filter(function(obj) {
      return obj.note === note.pitch;
    })[0];
    return {top: edges.top, bottom: edges.bottom};
  }

  function getXvals(note) {
    var edges = noteXMap.filter(function(obj) {
      return obj.time === note.startTime;
    })[0];
    return {left: edges.left, right: edges.right};
  }

    function getWidth(note) {
    var width = widthMap.filter(function(obj) {
      return obj.duration === note.duration;
    })[0].width;
    return width;
  }

  var noteYMap = [
    {note: "c5", top: 0, bottom: 39},
    {note: "b4", top: 40, bottom: 79},
    {note: "a4", top: 80, bottom: 119},
    {note: "g4", top: 120, bottom: 159},
    {note: "f4", top: 160, bottom: 199},
    {note: "e4", top: 200, bottom: 239},
    {note: "d4", top: 240, bottom: 279},
    {note: "c4", top: 280, bottom: 319}
  ]

  var noteXMap = [
    {time: "0:0:0", left: 0, right: 39},
    {time: "0:0:2", left: 40, right: 79},
    {time: "0:1:0", left: 80, right: 119},
    {time: "0:1:2", left: 120, right: 159},
    {time: "0:2:0", left: 160, right: 199},
    {time: "0:2:2", left: 200, right: 239},
    {time: "0:3:0", left: 240, right: 279},
    {time: "0:3:2", left: 280, right: 320}
  ]

    var widthMap = [
    {duration: "8n", width: 40},
    {duration: "4n", width: 80},
    {duration: "4n+8n", width: 120},
    {duration: "2n", width: 160},
    {duration: "2n+8n", width: 200},
    {duration: "2n+4n", width: 240},
    {duration: "2n+4n+8n", width: 280},
    {duration: "1n", width: 320}
  ]
  
  LoopFactory.drawLoop = function(loop) {
    loop.notes.forEach(function(note) {
      var x = getXvals(note);
      var y = getYvals(note);
      var width = getWidth(note);
      LoopFactory.addNote(null, x.left, x.right, y.top, width);
    })
  }

  LoopFactory.initialize = function() {
    Tone.Transport.cancel();
    loopMusicData = {};
    console.log("initializing canvas, clearing transport, clearing loopData");
    // initialize canvas for a 8 * 8 grid
    canvas = new fabric.Canvas('c', { 
        selection: false
      });
    canvas.setHeight(320);
    canvas.setWidth(320);
    canvas.renderAll();
    grid = 40;

    // draw lines on grid
    for (var i = 0; i < (320 / grid); i++) {
      canvas.add(new fabric.Line([ i * grid, 0, i * grid, 320], { stroke: '#ccc', selectable: false }));
      canvas.add(new fabric.Line([ 0, i * grid, 320, i * grid], { stroke: '#ccc', selectable: false }))
    }

    // create a new rectangle obj on mousedown in canvas area
    // change this to a double-click event (have to add a listener)?
    canvas.on('mouse:down', LoopFactory.addNote)

    // snap to grid when moving obj (doesn't work when resizing):
    canvas.on('object:modified', LoopFactory.snapToGrid)

  }

  LoopFactory.snapToGrid = function(options) {
      
      var newWidth = (Math.round(options.target.getWidth() / grid)) * grid;


      if (options.target.getWidth() !== newWidth) {
          options.target.set({ width: newWidth, scaleX: 1});
        }

      options.target.set({
        left: Math.round(options.target.left / grid) * grid,
        top: Math.round(options.target.top / grid) * grid
      });

      var idC = canvas.getActiveObject().Myid;

      // delete note from array of music data
      var noteToDelete = loopMusicData[idC]
      delete loopMusicData[idC];
      
      //delete old event
      Tone.Transport.clear(idC);

      //make new tone
      var top = canvas.getActiveObject().get('top');
      var left = canvas.getActiveObject().get('left');

      var xVal = left
      if(xVal < 0) xVal = 0;
      var yVal = top
      if(yVal < 0) yVal = 0;

      scheduleTone(xVal, yVal, newWidth, idC);

  }

  LoopFactory.addNote = function(options, left, right, top, width){
    var offsetX = left;
    var offsetY = top;
    var noteWidth = width || 40;

    if (options && options.target) {
      synth.triggerAttackRelease(getPitchStr(options.e.offsetY), "8n");  
      return;
    }

    if (options) {
      offsetX = Math.floor(options.e.offsetX);
      offsetY = Math.floor(options.e.offsetY);
      synth.triggerAttackRelease(getPitchStr(offsetY), "8n");
    }

    var newObjectId = ++lastObjId;

    canvas.add(new fabric.Rect({
        Myid: newObjectId,
        left: Math.floor(offsetX / 40) * 40,
        right: Math.floor(offsetX / 40) * 40,
        top: Math.floor(offsetY / 40) * 40,
        width: noteWidth, 
        height: 40, 
        fill: '#1E63A7', 
        originX: 'left', 
        originY: 'top',
        centeredRotation: true,
        minScaleLimit: 0,
        lockScalingY: true,
        lockScalingFlip: true,
        hasRotatingPoint: false
      })
    );

    // sound tone when clicking, and schedule
    scheduleTone(offsetX, offsetY, noteWidth, newObjectId);

  }

  LoopFactory.deleteNote = function(){
    var idC = canvas.getActiveObject().Myid;
    canvas.getActiveObject().remove();
    lastObjId--;

    // also delete tone event:
    Tone.Transport.clear(idC);

    // delete from JSON data store
    delete loopMusicData[idC];
  }

  LoopFactory.save = function() {

    var dataToSave = [];
    for (var i in loopMusicData) {
      dataToSave.push(loopMusicData[i]);
    }
    var id = $stateParams.loopId

    if (id==="new") {
      $http.post('/api/loops/', { notes: dataToSave })
      .then(function(res) { $state.go('loop', {loopId: res.data._id} ) });
    } else {$http.put('/api/loops/' + id, { notes: dataToSave })};
  }

  LoopFactory.getAll = function() {
    return $http.get('/api/loops/')
      .then(function(res) {
        return res.data;
      })
  }

  LoopFactory.delete = function() {
    return $http.delete('/api/loops/' + $stateParams.loopId)
      .then(function(res) {
        return res.data;
      })
  }

  LoopFactory.getMixes = function() {
    return $http.get('/api/loops/' + $stateParams.loopId + '/mixes')
      .then(function(res) {
        return res.data;
      })
  }

  return LoopFactory;

})