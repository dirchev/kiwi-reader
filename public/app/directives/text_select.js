app.directive('textSelect', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attrs, controller) {
      element.css({ cursor: 'pointer' });
      element.on('mouseup', function(e) {
        var range = window.getSelection() || document.getSelection() || document.selection.createRange();
        var selectedText = range.toString().trim();
        var selection = range.getRangeAt(0);
        scope.$apply(function(){
          scope.selectedText = selectedText;
          scope.selection = selection;
        });
        e.stopPropagation();
      });
    }
  }
})

.directive('previewBox', function($compile, $parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      scope.$watch(attr.content, function() {
        element.html($parse(attr.content)(scope));
        $compile(element.contents())(scope);
      }, true);
    }
  }
})
