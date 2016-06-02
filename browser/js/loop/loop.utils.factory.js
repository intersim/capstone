app.factory('LoopUtils', function() {

  var LoopUtils = {};
  // for saving in our BE
  var loopMusicData = {};

  var animationList = [];

  // mapping for notes to canvas sizes
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

  // mapping of beat to canvas sizes
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

  // mapping of duration to canvas widths
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

  LoopUtils.scheduleTone = function (objX, objY, width, objectId) {
    var pitch = LoopUtils.getPitchStr(objY);
    var duration = LoopUtils.getDurationStr(width);
    var startTime = LoopUtils.getBeatStr(objX);

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

  LoopUtils.getPitchStr = function (yVal) {
    if (yVal >= 0 && yVal < 40) return "c5";

  LoopUtils.getBeatStr = function (xVal) {
    if (xVal >= 0 && xVal < 40) return "0:0:0";
    if (xVal >= 40 && xVal < 80) return "0:0:2";
    if (xVal >= 80 && xVal < 120) return "0:1:0";
    if (xVal >= 120 && xVal < 160) return "0:1:2";
    if (xVal >= 160 && xVal < 200) return "0:2:0";
    if (xVal >= 200 && xVal < 240) return "0:2:2";
    if (xVal >= 240 && xVal < 280) return "0:3:0";
    if (xVal >= 280 && xVal < 320) return "0:3:2";
  };
  
  LoopUtils.getDurationStr = function (width) {
    if (width === 40) return "8n";
    if (width === 80) return "4n";
    if (width === 120) return "4n+8n";
    if (width === 160) return "2n";
    if (width === 200) return "2n+8n";
    if (width === 240) return "2n+4n";
    if (width === 280) return "2n+4n+8n";
    if (width === 320) return "1n";
  }
    if (yVal >= 40 && yVal < 80) return "b4";
    if (yVal >= 80 && yVal < 120) return "a4";
    if (yVal >= 120 && yVal < 160) return "g4";
    if (yVal >= 160 && yVal < 200) return "f4";
    if (yVal >= 200 && yVal < 240) return "e4";
    if (yVal >= 240 && yVal < 280) return "d4";
    if (yVal >= 280 && yVal < 320) return "c4";
  }

  LoopUtils.getYvals = function (note) {
    var edges = noteYMap.filter(function(obj) {
      return obj.note === note.pitch;
    })[0];
    return {top: edges.top, bottom: edges.bottom};
  }

  LoopUtils.getXvals = function (note) {
    var edges = noteXMap.filter(function(obj) {
      return obj.time === note.startTime;
    })[0];
    return {left: edges.left, right: edges.right};
  }

  LoopUtils.getWidth = function (note) {
    var width = widthMap.filter(function(obj) {
      return obj.duration === note.duration;
    })[0].width;
    return width;
  }

  LoopUtils.animationList = animationList;

  return LoopUtils;

});