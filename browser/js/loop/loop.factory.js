'use strict';

app.factory('LoopFactory', function($http){
  var LoopFactory = {};

  var canvas;
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
  var lastEvent = null;
  var lastObjId = 16;

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

  function scheduleTone (objX, objY, newObjectId) {
    var pitch = getPitchStr(objY);
    var duration = "8n";
    var startTime = getBeatStr(objX);
    var eventId = Tone.Transport.schedule(function(){
      synth.triggerAttackRelease(pitch, duration);
    }, startTime);
    loopMusicData[newObjectId] = {pitch: pitch, duration: duration, startTime: startTime};
    return eventId;
  }

  LoopFactory.initialize = function() {

    // initialize canvas for a 8 * 8 grid
    canvas = new fabric.Canvas('c', { 
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

    // create a new rectangle obj on mousedown in canvas area
    // change this to a double-click event (have to add a listener)?
    canvas.on('mouse:down', LoopFactory.addNote)

    // snap to grid when moving obj (doesn't work when resizing):
    canvas.on('object:modified', LoopFactory.snapToGrid )

  }

  LoopFactory.snapToGrid = function(options) {
      console.log("options", options)
      console.log('options target', options.target)
      options.target.set({
        left: Math.round(options.target.left / grid) * grid,
        top: Math.round(options.target.top / grid) * grid
      });
      var idC = canvas.getActiveObject().id
      var noteToDelete = loopMusicData[idC];
      delete loopMusicData[idC];
      
      //delete old event
      Tone.Transport.clear(idC - 16);
      lastEvent <= 0 ? lastEvent = null : lastEvent--;
      //make new one
      var xVal = Math.ceil(options.target.oCoords.tl.x)
      if(xVal < 0) xVal = 0;
      var yVal = Math.ceil(options.target.oCoords.tl.y)
      if(yVal < 0) yVal = 0;
      // console.log("x: ", xVal, "y: ", yVal)
      var newObjectId = newEventId + 16;
      var newEventId = scheduleTone(xVal, yVal, newObjectId);
      // console.log("newEventId: ", newEventId);
      newIdC = canvas.getActiveObject().set('id', newObjectId);
      // console.log("new objId: ", newIdC);
  }

  LoopFactory.addNote = function(options){
    if (options.target) {
      synth.triggerAttackRelease(getPitchStr(options.e.offsetY), "8n");
      return;
    }

    var newObjectId = lastObjId++;

    canvas.add(new fabric.Rect({
        id: newObjectId,
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

    var newItem = canvas.item(newObjectId);
    canvas.setActiveObject(newItem);
    // console.log('id of new obj: ', canvas.getActiveObject().get('id'));

    // sound tone when clicking, and schedule
    synth.triggerAttackRelease(getPitchStr(options.e.offsetY), "8n");
    // console.log('options e from 124', options.e)
    var eventId = scheduleTone(options.e.offsetX, options.e.offsetY, newObjectId);
    // console.log('id of new transport evt: ', eventId);

    //increment last event for clear button
    lastEvent === null ? lastEvent = 0 : lastEvent++;
  }

  LoopFactory.deleteNote = function(){
    var selectedObjectId = canvas.getActiveObject().id;
    canvas.getActiveObject().remove();
    lastObjId--;
    // also delete tone event:
    Tone.Transport.clear(selectedObjectId-16);
    // delete from JSON data store
    delete loopMusicData[selectedObjectId];
    lastEvent <= 0 ? lastEvent = null : lastEvent--;
  }

  LoopFactory.save = function() {
    var dataToSave = [];
    for (var i in loopMusicData) {
      dataToSave.push(loopMusicData[i]);
    }
    console.log(dataToSave);
    $http.post('/api/loops', { notes: dataToSave });
  }

  return LoopFactory;

})