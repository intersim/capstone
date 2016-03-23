app.directive('draggable', function() {
    return function(scope, element) {
      var elem = element[0];
      elem.draggable = true;

      elem.addEventListener(
        'dragstart',
        function(e) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('Text', this.id);
          this.classList.add('drag');
          return false;
        },
        false
      );

      elem.addEventListener(
        'dragend',
        function(e) {
          this.classList.remove('drag');
          return false;
        },
        false
      );
      
    }
});