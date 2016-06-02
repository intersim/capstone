app.factory('LoopCanvas', function(LoopUtils, LoopFactory) {

  var canvas;
  var grid;

  var LoopCanvas = {};
 
  LoopCanvas.addNote = function (newObjId, roundedX, roundedY, noteWidth) {
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
  }

  LoopCanvas.draw = function(note) {
    var x = LoopUtils.getXvals(note);
    var y = LoopUtils.getYvals(note);
    var width = LoopUtils.getWidth(note);
    LoopFactory.addNote(null, x.left, x.right, y.top, width);
  }

  LoopCanvas.snapToGrid = function(options) {

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
    
    // delete old object from notes data structure (used to animate notes)?
    // add updated object to new place in notes obj?

    //delete old event
    Tone.Transport.clear(idC);

    // literal edge cases
    if (options.target.left < 0 || options.target.left > 280) {
      return LoopFactory.deleteNote();
    }

    if (options.target.top < 0 || options.target.top > 280) {
      return LoopFactory.deleteNote();
    }

    //make new tone
    var top = canvas.getActiveObject().get('top');
    var left = canvas.getActiveObject().get('left');

    var xVal = left
    var yVal = top
    
    canvas.getActiveObject().set('fill', 'hsla(' + yVal + ', 85%, 70%, 1)');

    if (!notes[xVal]) notes[xVal] = [];
    notes[xVal].push(canvas.getActiveObject());
    LoopUtils.scheduleTone(xVal, yVal, newWidth, idC);
  }

  LoopCanvas.init = function() {
        // initialize canvas for an 8 * 8 grid
    canvas = new fabric.Canvas('c', { 
        selection: false,
        defaultCursor: 'pointer',
        freeDrawingCursor: 'pointer',
        hoverCursor: 'grab',
        moveCursor: 'grabbing',
        rotationCursor: 'pointer'
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
    // change this to a double-click event ?
    canvas.on('mouse:down', LoopFactory.addNote)

    // snap to grid when moving or elongating obj
    canvas.on('object:modified', LoopCanvas.snapToGrid)
  }

  LoopCanvas.initAnimation = function() {
    var lastAnimatedNoteRect = null;
    var animationList = LoopUtils.animationList;

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
      canvas.renderAll();

    }

    tick();
  }

  return LoopCanvas;

})