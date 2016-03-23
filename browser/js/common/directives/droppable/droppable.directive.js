app.directive('droppable', function(){
  return {
    scope: {
      drop: '&'
    },
    link: function(scope, element) {
      var elem = element[0];

      elem.addEventListener(
        'dragover',
        function(e) {
          e.dataTransfer.dropEffect = 'move';
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

          var item = document.getElementById( e.dataTransfer.getData('Text') );
          this.appendChild(item);

          scope.$apply('drop()');

          return false;
        },
        false
      );

    }
  }
})