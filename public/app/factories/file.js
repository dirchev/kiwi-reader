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
    delete: function(id){
      return $http.delete('/api/file/' + id);
    },
    share: function(file_id, user_email){
      return $http.post('/api/file/' + file_id + '/share', {user_email:user_email});
    },
    getShared: function(file_id){
      return $http.get('/api/file/' + file_id + '/share');
    },
    update: function(id, file){
      return $http.put('/api/file/' + id, {file: file})
    },
    addAnotation: function(file, anotation){
      return $http.post('/api/file/anotation',{id: file, anotation: anotation});
    },
    addComment: function(file, anotation, comment){
      return $http.post('/api/file/comment', {id:file, anotation_index:anotation, comment:comment})
    },
    deleteAnotation: function(file, anotation){
      return $http.delete('/api/file/'+file+'/anotation/'+anotation);
    }
  }
})
