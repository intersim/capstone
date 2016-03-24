'use strict';

app.directive('commentItem', function() {
  return {
    restrict: 'E',
    templateUrl: '/js/comments/comment.detail.html',
    controller:'CommentCtrl',
    scope: {
    	target: '=context',
    	comments: '=allcomments'
    }
  };
});
