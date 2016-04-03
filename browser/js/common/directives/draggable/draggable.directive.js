app.directive('draggable', function() {
  return {
    scope: {
      type: "@"
    },
    link: function(scope, element) {
      var elem = element[0];
      elem.draggable = true;

      var trash;

      elem.addEventListener(
        'dragstart',
        function(e) {
          e.dataTransfer.effectAllowed = scope.type;
          e.dataTransfer.setData('Text', this.id);
          this.classList.add('drag');
          trash = document.querySelector('.trash');
          trash.style.display = 'inline-block';
          return false;
        },
        false
      );

      elem.addEventListener(
        'dragend',
        function(e) {
          this.classList.remove('drag');
          trash.style.display = 'none';
          return false;
        },
        false
      );
      
    }
  }
});