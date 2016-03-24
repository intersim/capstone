app.directive('droppable', function($compile, CompositionFactory){
  return {
    scope: {
      drop: '&'
    },
    link: function(scope, element) {
      var elem = element[0];
      var counter = 0;

      elem.addEventListener(
        'dragover',
        function(e) {
          e.dataTransfer.dropEffect = 'copy';
          if (e.preventDefault) e.preventDefault();
          this.classList.add('over');
          console.log(this.classList);
          return false;
        },
        false
      );

      elem.addEventListener(
        'dragenter',
        function(e) {
          this.classList.add('over');
          return false;
        },
        false
      );

      elem.addEventListener(
        'dragleave',
        function(e) {
          this.classList.remove('over');
          return false;
        },
        false
      );

      elem.addEventListener(
        'drop',
        function(e) {
          if (e.stopPropagation) e.stopPropagation();
          if (e.preventDefault) e.preventDefault();
          this.classList.remove('over');
 
          var item = document.getElementById( e.dataTransfer.getData('Text') ).cloneNode(true);
          // grab info
          var info = this.id.split('-');
          var loop = item.dataset.loop;
          var measure = info[info.length - 1];
          var track = info[1];

          CompositionFactory.addLoop(loop, track, measure);

          item.id = item.id + '-' + counter;
          counter++;
          e.target.appendChild( item );
          // scope.$digest();
          scope.$apply('drop()');
          scope.$digest();

          return false;
        },
        false
      );

    }
  }
})