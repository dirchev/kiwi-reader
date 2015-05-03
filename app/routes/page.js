module.exports = function(app, passport, busboy){
  var pageCtrl = require('../controllers/pageCtrl')(app);
  var isLoggedIn = require('../services/is-authenticated')(app);
  

  // get all files
  app.get('/api/page', isLoggedIn, pageCtrl.get);

  // get Page HTML
  app.get('/api/page/html', pageCtrl.getPageHtml);

  // get page with id = page_id
  app.get('/api/page/:page_id', isLoggedIn, pageCtrl.getOne);

  // get page with id = page_id
  app.post('/api/page', isLoggedIn, pageCtrl.create);

  //delete page
  app.delete('/api/page/:page_id', isLoggedIn, pageCtrl.delete);

  // share page
  app.post('/api/page/:page_id/share', isLoggedIn, pageCtrl.share);
  
  // rename file
  app.post('/api/page/:page_id/rename', isLoggedIn, pageCtrl.rename);
};
