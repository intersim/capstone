'use strict';

app.factory('LoopFactory', function($http, $stateParams, $state, LoopUtils){
  var LoopFactory = {};

  var loopMusicData = LoopUtils.loopMusicData;

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

  LoopUtils.scheduleTone();

  LoopFactory.initialize = function() {
    Tone.Transport.cancel();
  }

  // var notes = {};

  LoopFactory.addNote = function(options, left, right, top, width) {

    var offsetX = left;
    var offsetY = top;
    var noteWidth = width || 40;

    if (options && options.target) {
      selectedInstr.triggerAttackRelease(LoopUtils.getPitchStr(options.e.offsetY), "8n");  
      return;
    }

    if (options) {
      offsetX = Math.floor(options.e.offsetX);
      offsetY = Math.floor(options.e.offsetY);
      selectedInstr.triggerAttackRelease(LoopUtils.getPitchStr(offsetY), "8n");
    }

    var newObjectId = ++lastObjId;

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

    var roundedX = Math.floor(offsetX / 40) * 40;
    var roundedY = Math.floor(offsetY / 40) * 40;
    
    // if (!notes[roundedX]) notes[roundedX] = [];
    // notes[roundedX].push(newRect);

    // sound tone when clicking, and schedule
    LoopUtils.scheduleTone(roundedX, roundedY, noteWidth, newObjectId);

  }

  LoopFactory.deleteNote = function(canvas){
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

});






