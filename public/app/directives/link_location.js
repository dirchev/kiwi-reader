app.directive('linkLocation', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attrs, controller) {
      element.css({ cursor: 'pointer' });
      element.on('click', function(e) {
        e.stopPropagation(); // fixes double firing
        scope.renderPageLink(attrs.linkLocation);
      });
    }
  };
});
