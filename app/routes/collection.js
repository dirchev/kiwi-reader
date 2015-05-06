
module.exports = function(app, passport, busboy){
  var collectionCtrl = require('../controllers/collectionCtrl');
  var isLoggedIn = require('../services/is-authenticated')(app);

  // get all user's collections
  app.get('/api/collection', isLoggedIn, collectionCtrl.read);
  
  // get collection with id = collection_id
  app.get('/api/collection/:collection_id', isLoggedIn, collectionCtrl.readOne);

  // create new empty collection
  app.post('/api/collection', isLoggedIn, collectionCtrl.create);
  
  // rename file
  app.post('/api/collection/:collection_id/rename', isLoggedIn, collectionCtrl.rename);
  
  app.delete('/api/collection/:collection_id', isLoggedIn, collectionCtrl.delete);
  
  // add file,book or page to collection
  // requires something like
  /*
    {
      collection_id : "somecollectionidhere",
      thing: {
        type: 'file',
        id: 'someid'
      }
    }
  */
  app.post('/api/collection/add', isLoggedIn, collectionCtrl.addThing);
  
  // removes file,book or page from collection
  // requires something like
  /*
    {
      collection_id : "somecollectionidhere",
      thing: {
        type: 'file',
        id: 'someid'
      }
    }
  */
  app.post('/api/collection/remove', isLoggedIn, collectionCtrl.removeThing)
};