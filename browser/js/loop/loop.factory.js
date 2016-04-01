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
  
  var selectedInstr = synth;

  // initialize looping
  Tone.Transport.loop = true;
  Tone.Transport.loopStart = "0:0:0";
  Tone.Transport.loopEnd = "0:4:0";
  
  // intialize Transport event timeline tracking
  var lastObjId = 15;

  // for saving in our BE
  var loopMusicData = {};

  // for animations
  var lastNotePlayed = {};
  var lastNoteArr = [];

  var lastAnimatedNoteRect = null;
  var lastAnimatedArr = [];

function animColor (wallTime) {
  return Math.sin(wallTime/1000);
}

  function tick (wallTime) {
    // wall time - start time (what has been pushed into the animation list) is the amount of time since the note was struck
    // after animation period, remove that animation from list
    // during that time, then the color is f(walltime - startime), where f is some crazy function (sine? start with a constant...)
    window.requestAnimationFrame(tick);
    if (!canvas) return;
    // E: set old color back to last animated note

    animationList.forEach(function (animation) {
      animation.note.set('fill', '#ffffff');
      if (wallTime > animation.startTime + animation.duration) {
        animation.note.set('fill', animation.oldColor);
        animation.dead = true;
      }
    });

    animationList = animationList.filter(anim => !anim.dead);

    // lastNoteArr.forEach(function (note) {
    //   note.set('fill', '#ff00ff');
    // })
    // // E: set new exciting color on note now playing
    // lastAnimatedArr.forEach(function (note) {
    //   note.set('fill', '#fff');
    // })
    canvas.renderAll();

    lastAnimatedArr = lastNoteArr;

    // lastAnimatedNoteRect && lastAnimatedNoteRect.set('fill', '#fff');

    
    // lastNotePlayed.rect && lastNotePlayed.rect.set('fill', '#FF00FF');
    // canvas.renderAll();

    // lastAnimatedNoteRect = lastNotePlayed.rect;

  }

  tick();

  var animationList = [];

  function scheduleTone (objX, objY, width, objectId) {
    var pitch = getPitchStr(objY);
    var duration = getDurationStr(width);
    var startTime = getBeatStr(objX);

    var eventId = Tone.Transport.schedule(function(){
      selectedInstr.triggerAttackRelease(pitch, duration);
      // E: animate notes here!
      // lastNoteArr = notes[objX];
      notes[objX].forEach(function (note) {
        animationList.push({note: note, oldColor: note.get('fill'), startTime: window.performance.now(), duration: 100 });
      });
      // in tick callback: use info to set color, other stuff
      // push an animation (what note, pulse color, start time (using window.performance.now)) into a stack...
      // animationList.push({noteObj: lastNotePlayed.rect, oldColor: lastNotePlayed.rect.get('fill'), startTime: window.performance.now() })
    }, startTime, objectId);
    loopMusicData[objectId] = {pitch: pitch, duration: duration, startTime: startTime};
    
    // console.log("lastNoteArr: ", lastNoteArr);
    // console.log("lastAnimatedArr: ", lastAnimatedArr);
    return eventId;
  }

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
  ];

  var widthMap = [
    {duration: "8n", width: 40},
    {duration: "4n", width: 80},
    {duration: "4n+8n", width: 120},
    {duration: "2n", width: 160},
    {duration: "2n+8n", width: 200},
    {duration: "2n+4n", width: 240},
    {duration: "2n+4n+8n", width: 280},
    {duration: "1n", width: 320}
  ];
  
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
      canvas.add(new fabric.Line([ i * grid, 0, i * grid, 320], { stroke: '#686868', selectable: false }));
      canvas.add(new fabric.Line([ 0, i * grid, 320, i * grid], { stroke: '#686868', selectable: false }))
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

  var notes = {};

  LoopFactory.addNote = function(options, left, right, top, width){
    var offsetX = left;
    var offsetY = top;
    var noteWidth = width || 40;

    if (options && options.target) {
      selectedInstr.triggerAttackRelease(getPitchStr(options.e.offsetY), "8n");  
      return;
    }

    if (options) {
      offsetX = Math.floor(options.e.offsetX);
      offsetY = Math.floor(options.e.offsetY);
      selectedInstr.triggerAttackRelease(getPitchStr(offsetY), "8n");
    }

    var newObjectId = ++lastObjId;

    var roundedX = Math.floor(offsetX / 40) * 40;
    var roundedY = Math.floor(offsetY / 40) * 40;

    var newRect = new fabric.Rect({
        Myid: newObjectId,
        left: roundedX,
        right: roundedX,
        top: roundedY,
        width: noteWidth, 
        height: 40, 
        fill: 'hsla(' + roundedY + ', 85%, 70%, 1)',
        originX: 'left', 
        originY: 'top',
        centeredRotation: true,
        minScaleLimit: 0,
        lockScalingY: true,
        lockScalingFlip: true,
        hasRotatingPoint: false
      });

    canvas.add(newRect);
    if (!notes[roundedX]) notes[roundedX] = [];
    notes[roundedX].push(newRect);

    // sound tone when clicking, and schedule
    scheduleTone(roundedX, roundedY, noteWidth, newObjectId);

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

  LoopFactory.save = function(copy, meta) {

    var dataToSave = [];
    for (var i in loopMusicData) {
      dataToSave.push(loopMusicData[i]);
    }
    if(meta) meta.notes=dataToSave;
    var id = $stateParams.loopId;

    if (id === "new" || copy) {
      $http.post('/api/loops/', meta)
      .then(function(res) { 
        $state.go('loop', {loopId: res.data._id} ) });
    } else {
      if (!meta) $http.put('/api/loops/' + id, {notes: dataToSave})
      else $http.put('/api/loops/' + id, meta)
    };
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

  LoopFactory.getMixes = function(loopId) {
    var loopId = loopId || $stateParams.loopId;
    return $http.get('/api/loops/' + loopId + '/mixes')
      .then(function(res) {
        return res.data;
      })
  }

  return LoopFactory;

})