app.factory('Page', function($http){
  return {
    get: function(){
      return $http.get('/api/page');
    },
    getPageHTML: function(url){
      return $http.post('/api/page/html', {url:url});
    },
    getOne: function(id){
      return $http.get('/api/page/' + id);
    },
    create: function(content, link){
      console.log('creating page');
      return $http.post('/api/page', {page_content:content, page_link: link});
    },
    delete: function(id){
      return $http.delete('/api/page/' + id);
    },
    share: function(page_id, user_email){
      return $http.post('/api/page/' + page_id + '/share', {user_email:user_email});
    },
    rename: function(page_id, name){
     return $http.post('/api/page/' + page_id + '/rename', {name:name});
    },
  };
});
