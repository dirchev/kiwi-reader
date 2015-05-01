app.factory('Search', function($http){
	return {
		all: function(searchPhrase){
			return $http.get('/api/search/' + searchPhrase);
		}	
	};
});