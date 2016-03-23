'use strict';

app.directive('CommentItem', function() {
  return {
    restrict: 'E',
    templateUrl: '/js/tasks/task.item.html',
    controller:'CommentCtrl'
  };
});
