// making sound

var synth = new Tone.SimpleSynth().toMaster();

Tone.Transport.schedule(function(time){
  synth.triggerAttackRelease("C4", "4n");
}, "0:1:0");

Tone.Transport.schedule(function(time){
  synth.triggerAttackRelease("E4", "4n");
}, "0:2:0");

Tone.Transport.schedule(function(time){
  synth.triggerAttackRelease("G4", "4n");
}, "0:3:0");

Tone.Transport.schedule(function(time){
  synth.triggerAttackRelease("E4", "4n");
}, "0:4:0");

Tone.Transport.schedule(function(time){
  synth.triggerAttackRelease("G4", "2n");
}, "1:1:0");

$('#play').click(function () {
  Tone.Transport.start();
});

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