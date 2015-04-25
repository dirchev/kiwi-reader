app.directive('textSelect', function(){
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs, controller) {
      element.css({ cursor: 'pointer' });
      element.on('mouseup', function(e) {
        var range = window.getSelection() || document.getSelection() || document.selection.createRange();
        var selectedText = range.toString().trim();
        var selection = range.getRangeAt(0);
        scope.$apply(function(){
          scope.selectedText = selectedText;
          scope.selection = selection;
          scope.showAnotations = true;
        });
        e.stopPropagation();
        if(typeof scope.onTextSelect !== 'undefined'){
          scope.onTextSelect();
        }
      });
    }
  };
});
