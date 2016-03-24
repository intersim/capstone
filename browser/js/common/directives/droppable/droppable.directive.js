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
          e.dataTransfer.dropEffect = 'copyMove';
          if (e.preventDefault) e.preventDefault();
          this.classList.add('over');
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

          var oldItem = document.getElementById( e.dataTransfer.getData('Text') );
          var newItem = oldItem.cloneNode(true);
          // grab info
          var info = this.id.split('-');
          var loop = newItem.dataset.loop;
          var measure = info[info.length - 1];
          var track = info[info.indexOf('t') + 1];

          CompositionFactory.addLoop(loop, track, measure);
          console.log(oldItem);
          // console.log('TYPE IS: ' + scope.type + " old item is " + oldItem)
          if (oldItem.getAttribute('type') === 'move') {
            CompositionFactory.removeLoop(track, measure);
            oldItem.remove();
          }

          newItem.id = newItem.id + '-' + counter;
          counter++;

          newItem.setAttribute('type', 'move')

          scope.$apply(function() {
            var content = $compile( newItem )(scope);
            element.append( content );
          })

          scope.$apply('drop()');
          scope.$digest();

          return false;
        },
        false
      );

    }
  }
})