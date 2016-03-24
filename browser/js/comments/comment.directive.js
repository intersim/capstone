'use strict';

app.directive('commentItem', function() {
  return {
    restrict: 'E',
    templateUrl: '/js/tasks/task.item.html',
    controller:'CommentCtrl'
  };
});
