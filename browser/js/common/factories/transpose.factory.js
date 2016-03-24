app.factory('TransposeFactory', function(){
  var TransposeFactory = {};

  // using the note transposer module tonal.js
  TransposeFactory.transpose = function (noteStr, intervalStr) {
    return transpose(noteStr, intervalStr);
  }

  TransposeFactory.transposeArr = function (scaleArr, intervalStr) {
    return scaleArr.map(function (e) {
      return transpose(e, intervalStr);
    })
  }

  TransposeFactory.changeOctave = function (scaleArr, num) {
    var newNote;
    var cIdx;
    //helps with notes that are sharps or flats
    var noteHelper = function (el, number) {
      el.length === 3 ? newNote = el.substr(0,2) + number.toString() : newNote = el[0] + number.toString();
    }

    return scaleArr.map(function (e, idx, arr) {
      noteHelper(e, num);
      //check if note is C, where octave break happens
      if (e[0] == 'C' && idx !== 0) {
        cIdx = idx;
        noteHelper(e, num + 1)
      }
      //check if note is after octave break at C
      if (idx > cIdx) {
        noteHelper(e, num + 1);
      }

      return newNote;
    })
  }

  // make major scales
  var cMajor = ['C4','D4','E4','F4','G4','A4','B4','C5'];
  var dbMajor = TransposeFactory.transposeArr(cMajor, '2m');
  var dMajor = TransposeFactory.transposeArr(cMajor, '2M');
  var ebMajor = TransposeFactory.transposeArr(cMajor, '3m');
  var eMajor = TransposeFactory.transposeArr(cMajor, '3M');
  var fMajor = TransposeFactory.transposeArr(cMajor, '4P');
  var gbMajor = TransposeFactory.transposeArr(cMajor, '5d');
  var gMajor = TransposeFactory.transposeArr(cMajor, '5P');
  var abMajor = TransposeFactory.transposeArr(cMajor, '6m');
  var aMajor = TransposeFactory.transposeArr(cMajor, '6M');
  var bbMajor = TransposeFactory.transposeArr(cMajor, '7m');
  var bMajor = TransposeFactory.transposeArr(cMajor, '7M');

  // make natural minor scales
  var cMinor = ['C4','D4','Eb4','F4','G4','Ab4','Bb4','C5'];
  var dbMinor = TransposeFactory.transposeArr(cMinor, '2m');
  var dMinor = TransposeFactory.transposeArr(cMinor, '2M');
  var ebMinor = TransposeFactory.transposeArr(cMinor, '3m');
  var eMinor = TransposeFactory.transposeArr(cMinor, '3M');
  var fMinor = TransposeFactory.transposeArr(cMinor, '4P');
  var gbMinor = TransposeFactory.transposeArr(cMinor, '5d');
  var gMinor = TransposeFactory.transposeArr(cMinor, '5P');
  var abMinor = TransposeFactory.transposeArr(cMinor, '6m');
  var aMinor = TransposeFactory.transposeArr(cMinor, '6M');
  var bbMinor = TransposeFactory.transposeArr(cMinor, '7m');
  var bMinor = TransposeFactory.transposeArr(cMinor, '7M');

  //set on TransposeFactory (does this also need to be a function that returns the object?)
TransposeFactory.allScales = function () {
    // maybe return an array instead of an object?
    return {
      cMajor: cMajor,
      dbMajor: dbMajor,
      dMajor: dMajor,
      ebMajor: ebMajor,
      eMajor: eMajor,
      fMajor: fMajor, 
      gbMajor: gbMajor,
      gMajor: gMajor,
      abMajor: abMajor,
      aMajor: aMajor,
      bbMajor: bbMajor,
      bMajor: bMajor,
      cMinor: cMinor,
      dbMinor: dbMinor,
      dMinor: dMinor,
      ebMinor: ebMinor,
      eMinor: eMinor,
      fMinor: fMinor, 
      gbMinor: gbMinor,
      gMinor: gMinor,
      abMinor: abMinor,
      aMinor: aMinor,
      bbMinor: bbMinor,
      bMinor: bMinor
    }
  }

  return TransposeFactory;

});