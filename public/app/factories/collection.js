/* global app */
app.factory('Collection', function($http){
  return {
    get: function(){
      return $http.get('/api/collection');
    },
    getOne: function(collection_id){
      return $http.get('/api/collection/' + collection_id);
    },
    create: function(title){
      return $http.post('/api/collection', {title:title});
    },
    remove: function(collection_id){
      return $http.delete('/api/collection/' + collection_id);
    },
    rename: function(collection_id, title){
      return $http.post('/api/collection/' + collection_id + '/rename', {title: title});
    },
    addThing: function(data){
      return $http.post('/api/collection/add', data);
    }
  };
});
