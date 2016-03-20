// making sound

var synth = new Tone.SimpleSynth().toMaster();

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

// getting info about Tone.js audio context
console.log('Tone.Transport: ', Tone.Transport);
console.log('Tone.Master: ', Tone.Master);

// ended event?
// Tone.Transport.on('ended', function(){
//   console.log('heard an ended event');
// });

// setting up recorder
var gainNode = Tone.Master.input;
var rec = new Recorder(gainNode);

$('#record').click(function () {
  // we have to play the node to record it!
  Tone.Transport.start();
  rec.record();
});

$('#stop-record').click(function () {
  // can we make this happen automatically on an 'ended' event?
  rec.stop();
});

$('#clear-record').click(function () {
  console.log('recording cleared');
  rec.clear();
});

$('#export').click(function () {
  // exports as a WAV and downloads
  rec.exportWAV(function (blob) {
    console.log('blob: ', blob);
    Recorder.forceDownload(blob)
  });
});

var currentBeat = null;
var lastEvent = null;

// assuming 4/4 for now
function nextBeat (timeStr) {
  if (!currentBeat) {
    currentBeat = "0:0:0";

    //increment last event for clear button
    lastEvent === null ? lastEvent = 0 : lastEvent++;
    return currentBeat;
  }

  var timeArr = timeStr.split(":").map(function (el) {
    return parseInt(el);
  }).reverse();

  timeArr[0]+=2;

  if (timeArr[0] >= 4) {
    timeArr[0] = 0;
    timeArr[1]++; 
  }

  if (timeArr[1] >= 4) {
    timeArr[1] = 0;
    timeArr[2]++; 
  }

  currentBeat = timeArr.reverse().join(":");

  //increment last event for clear button
  lastEvent === null ? lastEvent = 0 : lastEvent++;

  return currentBeat;
};

$('#C4').click(function () {
   Tone.Transport.schedule(function(time){
    synth.triggerAttackRelease("C4", "8n");
  }, nextBeat(currentBeat));
});

$('#D4').click(function () {
  Tone.Transport.schedule(function(time){
    synth.triggerAttackRelease("D4", "8n");
  }, nextBeat(currentBeat));
});

$('#E4').click(function () {
  Tone.Transport.schedule(function(time){
    synth.triggerAttackRelease("E4", "8n");
  }, nextBeat(currentBeat));
});

$('#F4').click(function () {
  Tone.Transport.schedule(function(time){
    synth.triggerAttackRelease("F4", "8n");
  }, nextBeat(currentBeat));
});

$('#G4').click(function () {
  Tone.Transport.schedule(function(time){
    synth.triggerAttackRelease("G4", "8n");
  }, nextBeat(currentBeat));
});

$('#clear').click(function () {
  Tone.Transport.clear(lastEvent);
  lastEvent <= 0 ? lastEvent = null : lastEvent--;
})