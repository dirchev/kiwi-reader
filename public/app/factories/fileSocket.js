app.factory('FileSocket', function(){
  var FileSocket;
  return {
    connect: function(file_id){
      FileSocket = io();
    }
  }
})
