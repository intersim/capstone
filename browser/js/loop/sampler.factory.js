app.factory('SamplerFactory', function(){
  var SamplerFactory = {};

  var synth = new Tone.PolySynth(16, Tone.SimpleSynth, {
            "oscillator" : {
                "partials" : [0, 2, 3, 4],
            },
            "volume" : -12
        }).toMaster();

  SamplerFactory.test = function () {
    var piano = new Tone.PolySynth(8, Tone.Sampler, {
      "A" : {
          4 : "./piano/piano.A4.ogg"
          },
      "B" : {
          4 : "./piano/piano.B4.ogg"
          },
      "C" : {
          4 : "./piano/piano.C4.ogg",
          5 : "./piano/piano.C5.ogg"
          },
      "D" : {
          4 : "./piano/piano.D4.ogg"
          },
      "E" : {
          4 : "./piano/piano.E4.ogg"
          },
      "F" : {
        4 : "./piano/piano.F4.ogg"
          },
      "G" : {
          4 : "./piano/piano.G4.ogg",
          },
      "volume" : -12
    }).toMaster();
  };

  return SamplerFactory;
});