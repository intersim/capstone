app.factory('LoopAnimation', function() {
	var LoopAnimation = {};

	LoopAnimation.init = function() {
    var lastAnimatedNoteRect = null;

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

  return LoopAnimation;
});