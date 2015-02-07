var EPub = require('epub');
var Book = require('../models/book');
var fs = require('fs');
var office = require('office');
var cheerio = require('cheerio');
var getBookTitle = function(filePath, callback){
  var book = new EPub('.' + filePath);
  book.on("end", function(){
    return callback(book.metadata.title);
  });
  book.parse();
}
module.exports = function(app, passport){

  app.post('/book', isLoggedIn, function(req, res){
    var book = new Book();
    book.file = '/uploads/books/book.epub';
    getBookTitle(book.file, function(title){
      book.title = title;
      book.users.push(req.user._id);
      book.save(function(err){
        if(err)
          console.log(err);
        res.json({success: true});
      });
    });
  });

  app.get('/bookD', function(req, res){
    office.parse('./sth.docx', function(err, data){
      if(err){
        console.log(err);
      }
      var $ = cheerio.load(data);
      var content = $('body').html();
      res.send(content);
    })
  })

  app.get('/book/:book_id', function(req, res){
    var book_id = req.params.book_id;
    Book.findById(book_id, function(err, book){
      if(err){
        console.log(err);
        res.json({success:false, message: 'Възникна проблем при търсенето на тази книга.'});
      } else if(!book){
        res.json({success:false, message: 'Книгата не е намерена.'});
      } else{
        res.json({success:true,book: book});
      }

    })
  });

  app.get('/book', isLoggedIn, function(req, res){
    Book.find({users: req.user._id}, function(err, books){
      res.json(books);
    });
  });

  app.post('book/:book_id/share', isLoggedIn, function(req, res){
    var userToShare = req.body.user_id;
    Book.findOne({_id: req.params.book_id, user: req.user._id}, function(err, book){
      if(err)
        console.log(err);
      book.users.push(userToShare);
      book.save();
    })
  })

  app.delete('/book/:book_id', isLoggedIn, function(req, res){
    Book.remove({_id: req.params.book_id, users: req.user._id}, function(err, book){
      if(err)
        console.log(err);
      res.send({success:true});
    })
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
