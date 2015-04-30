app.factory('File', function($http){
  return {
    get: function(){
      return $http.get('/api/file/');
    },
    getOne: function(id){
      return $http.get('/api/file/' + id);
    },
    create: function(){
      return $http.post('/api/file/');
    },
    createDropboxFile : function(file){
      return $http.post('/api/file/dropbox', {file:file});
    },
    delete: function(id){
      return $http.delete('/api/file/' + id);
    },
    share: function(file_id, user_email){
      return $http.post('/api/file/' + file_id + '/share', {user_email:user_email});
    },
    rename: function(file_id, name){
      return $http.post('/api/file/' + file_id + '/rename', {name:name});
    },
    public: function(file_id, public){
      return $http.post('/api/file/' + file_id + '/public', {public:public});
    }
  };
});
