app.factory('Search', function($http){
	return {
		all: function(searchPhrase){
			return $http.get('/api/search/' + searchPhrase);
		},
		file: function(searchPhrase){
			return $http.get('/api/search/' + searchPhrase + '/file')
		},
		book: function(searchPhrase){
			return $http.get('/api/search/' + searchPhrase + '/book')
		},
		page: function(searchPhrase){
			return $http.get('/api/search/' + searchPhrase + '/page')
		},
	};
});