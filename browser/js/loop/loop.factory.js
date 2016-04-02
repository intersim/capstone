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
      // make sound
      selectedInstr.triggerAttackRelease(pitch, duration);
      // change note color
      notes[objX].forEach(function (note) {
        animationList.push({note: note, oldColor: note.get('fill'), startTime: window.performance.now(), duration: 100 });
      });
    }, startTime, objectId);

    //save music data
    loopMusicData[objectId] = {pitch: pitch, duration: duration, startTime: startTime};
    
    return eventId;
  }

  function getPitchStr (yVal) {
    if (yVal >= 0 && yVal < grid) return "c5";
    if (yVal >= grid && yVal < grid * 2) return "b4";
    if (yVal >= grid * 2 && yVal < grid * 3) return "a4";
    if (yVal >= grid * 3 && yVal < grid * 4) return "g4";
    if (yVal >= grid * 4 && yVal < grid * 5) return "f4";
    if (yVal >= grid * 5 && yVal < grid * 6) return "e4";
    if (yVal >= grid * 6 && yVal < grid * 7) return "d4";
    if (yVal >= grid * 7 && yVal < grid * 8) return "c4";
  }

  function getBeatStr (xVal) {
    if (xVal >= 0 && xVal < grid) return "0:0:0";
    if (xVal >= grid && xVal < grid * 2) return "0:0:2";
    if (xVal >= grid * 2 && xVal < grid * 3) return "0:1:0";
    if (xVal >= grid * 3 && xVal < grid * 4) return "0:1:2";
    if (xVal >= grid * 4 && xVal < grid * 5) return "0:2:0";
    if (xVal >= grid * 5 && xVal < grid * 6) return "0:2:2";
    if (xVal >= grid * 6 && xVal < grid * 7) return "0:3:0";
    if (xVal >= grid * 7 && xVal < grid * 8) return "0:3:2";
  }

  function getDurationStr (width) {
    if (width === grid) return "8n";
    if (width === grid * 2) return "4n";
    if (width === grid * 3) return "4n+8n";
    if (width === grid * 4) return "2n";
    if (width === grid * 5) return "2n+8n";
    if (width === grid * 6) return "2n+4n";
    if (width === grid * 7) return "2n+4n+8n";
    if (width === grid * 8) return "1n";
  }


  function getYvals(note) {
    var noteYMap = {
      c5: {top: 0, bottom: grid - 1},
      b4: {top: grid, bottom: (grid * 2) - 1},
      a4: {top: grid * 2, bottom: (grid * 3) - 1},
      g4: {top: grid * 3, bottom: (grid * 4) - 1},
      f4: {top: grid * 4, bottom: (grid * 5) - 1},
      e4: {top: grid * 5, bottom: (grid * 6) - 1},
      d4: {top: grid * 6, bottom: (grid * 7) - 1},
      c4: {top: grid * 7, bottom: (grid * 8) - 1}
    }
    var edges = noteYMap[note.pitch];
    return {top: edges.top, bottom: edges.bottom};
  }

  function getXvals(note) {
    var noteXMap = {
      "0:0:0": {left: 0, right: grid - 1},
      "0:0:2": {left: grid, right: (grid * 2) - 1},
      "0:1:0": {left: grid * 2, right: (grid * 3) - 1},
      "0:1:2": {left: grid * 3, right: (grid * 4) - 1},
      "0:2:0": {left: grid * 4, right: (grid * 5) - 1},
      "0:2:2": {left: grid * 5, right: (grid * 6) - 1},
      "0:3:0": {left: grid * 6, right: (grid * 7) - 1},
      "0:3:2": {left: grid * 7, right: grid * 8}
    }
    var edges = noteXMap[note.startTime]
    return {left: edges.left, right: edges.right};
  }

  function getWidth(note) {
    var widthMap = {
      "8n": grid,
      "4n": grid * 2,
      "4n+8n": grid * 3,
      "2n": grid * 4,
      "2n+8n": grid * 5,
      "2n+4n": grid * 6,
      "2n+4n+8n": grid * 7,
      "1n": grid * 8
    }
    return widthMap[note.duration]
  }
  
  LoopFactory.drawLoop = function(loop) {
    console.log('drawing loop')
    loop.notes.forEach(function(note) {
      var x = getXvals(note);
      var y = getYvals(note);
      var width = getWidth(note);
      LoopFactory.addNote(null, x.left, x.right, y.top, width);
    })
  }
  // canvasId - element to contain canvas,
  // cellSize - size of notes in grid
  // minify - if not supplied, grid and colors applied
  //    if truthy, only representation of canvas is created
  LoopFactory.initialize = function(canvasId, cellSize, minify) {
    Tone.Transport.cancel();
    loopMusicData = {};
    console.log("initializing canvas, clearing transport, clearing loopData");
    // initialize canvas for an 8 * 8 grid
    canvas = new fabric.Canvas(canvasId, { 
        selection: false,
        defaultCursor: 'pointer',
        freeDrawingCursor: 'pointer',
        hoverCursor: 'grab',
        moveCursor: 'grabbing',
        rotationCursor: 'pointer'
      });
    canvas.setHeight(cellSize * 8);
    canvas.setWidth(cellSize * 8);
    canvas.renderAll();
    grid = cellSize;

    if (!minify) {
      // draw lines on grid
      for (var i = 0; i < (cellSize * 8 / grid); i++) {
        canvas.add(new fabric.Line([ i * grid, 0, i * grid, cellSize * 8], { stroke: '#686868', selectable: false }));
        canvas.add(new fabric.Line([ 0, i * grid, cellSize * 8, i * grid], { stroke: '#686868', selectable: false }))
      }

      // create a new rectangle obj on mousedown in canvas area
      // change this to a double-click event ?
      canvas.on('mouse:down', LoopFactory.addNote)

      // snap to grid when moving or elongating obj
      canvas.on('object:modified', LoopFactory.snapToGrid)

    }
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
      
      // delete old object from notes data structure (used to animate notes)
      // add updated object to new place in notes obj

      //delete old event
      Tone.Transport.clear(idC);

      //make new tone
      var top = canvas.getActiveObject().get('top');
      var left = canvas.getActiveObject().get('left');

      var xVal = left
      if(xVal < 0) xVal = 0;
      var yVal = top
      if(yVal < 0) yVal = 0;

      canvas.getActiveObject().set('fill', 'hsla(' + yVal + ', 85%, 70%, 1)');

      if (!notes[xVal]) notes[xVal] = [];
      notes[xVal].push(canvas.getActiveObject());
      scheduleTone(xVal, yVal, newWidth, idC);

  }

  var notes = {};

  LoopFactory.addNote = function(options, left, right, top, width){
    var offsetX = left;
    var offsetY = top;
    var noteWidth = width || grid;

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

    var roundedX = Math.floor(offsetX / grid) * grid;
    var roundedY = Math.floor(offsetY / grid) * grid;

    var newRect = new fabric.Rect({
        Myid: newObjectId,
        left: roundedX,
        right: roundedX,
        top: roundedY,
        width: noteWidth, 
        height: grid, 
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

    if (grid === 12.5) newRect.set('fill', '#fff');
    
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