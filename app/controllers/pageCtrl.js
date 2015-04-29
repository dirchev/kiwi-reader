var User = require('../models/user');
var Page = require('../models/page');
var unfluff = require('unfluff');
var request = require('request');
var cheerio = require('cheerio');
var lastService = require('../services/last');

module.exports = function(){
  return {
    get: function(req, res){
      Page.find({'users':req.user._id}).exec(function(err, pages){
        if(err){
          console.log('Error while searching for user: ' + err);
          res.json({success:false, message:'Възникна грешка при взимането на информацията.'});
        } else {
          res.json({success:true, pages: pages});
        }
      });
    },
    getOne : function(req, res){
      var page_id = req.params.page_id;
      Page
        .findOne({'_id': page_id, 'users':req.user._id})
        .populate('users anotations.user anotations.comments.user', 'data.name data.email')
        .exec(function(err, page){
          if(err){
            console.log('Error while searching for user: ' + err);
            res.json({success:false, message:'Възникна грешка при взимането на информацията.'});
          } else {
            lastService.addLastPage(req.user._id, page_id, function(err){
              if(err){
                res.json({success:false, message: err});
              } else {
                res.json({success:true, page: page});
              }
            });
          }
        });
    },
    create: function(req, res){
      var page_link = req.body.page_link;
      var page_content = req.body.page_content;
      getPageData(page_link, function(page_data){
        var page = new Page();
        page.title = page_data.title;
        page.image = page_data.image || 'http://kiwi-reader.herokuapp.com/img/kiwi-article.png';
        page.content = page_content;
        page.link = page_link;
        page.users = [];
        page.users.push(req.user._id);
        page.save(function(err){
          if(err){
            console.log(err);
            res.json({success:false, message:"Грешка при записването на страницата. "});
          } else {
            res.json({success:true});
          }
        });
      });
    },
    delete: function(req, res){
      var page_id = req.params.page_id;
      Page.findOne({_id: page_id, users: req.user._id}, function(err, page){
        if(page.users.length === 1){
          Page.remove({_id: page_id, users: req.user._id}, function(err, page){
            if(err)
              console.log(err);
            console.log('Deleting page: '+ page);
            res.json({success:true});
          });
        } else {
          Page.update(
            {_id: page_id, users: req.user._id},
            {$pull:{users:req.user._id}},
            {upsert:false},
            function(err){
              if(err)
                console.log(err);
              res.json({success:true});
            }
          );
        }
      });
    },
    share: function(req, res){
      // Put data in variables for easy access
      if(userEnteredEmail(req.user) === false){
        res.json({success:false, message: 'Не може да споделяте файлове без да сте въвели email. Въведете Вашият email от меню "Профил".'});
      } else {
        var page_id = req.params.page_id;
        var user_email = req.body.user_email;
        // Get all data for the user, we want to share file to
        User.findOne({'data.email': user_email}, function(err, user){
          if(err){
            console.log('Error while searching for user: ' + err);
          } else if(!user){
            // if user not exists (bad email) send message to client
            res.json({success:false, message: 'Не е намерен потребител с този email.'});
          } else {
            // update file, that is with mentioned id, if the user who wants
            //to share it is its owner and if it is not shared to the samo user before
            Page
            .update(
              // select the file with id = file_id and one of his users is req.user
              {$and:[{_id: page_id, users: req.user._id},
              // check if file is not already shared with that user
              {users: {$ne: user._id}}]},
              // push the user to file.users array
              {$push: {'users':user._id}},
              // options
              {upsert:false})
            .exec(function(err, file){
              if(err){
                console.log('Error while updating file: ' + err);
                res.json({success:false, message: 'Този файл вече е споделен с този потребител.'});
              } else {
                res.json({success:true, page_id: page_id});
              }
            });
          }
        });
      }
    },
    getPageHtml: function(req, res){
      var url = req.param('url');
      request(url, function(err, resp, body){
        if(err){
          res.json({success:false, message: 'Проблем при намирането на страницата ' + err});
        } else {
          prepareHTML(body, function(page){
            res.send(page);
          });
        }
      });
    }, // end of getPageHtml
    updateContent: function(page_id, content, callback){
      Page.findById(page_id).exec(function(err, page){
        if(err){
          console.log(err);
          callback(err);
        } else {
          page.content = content;
          page.save(function(err, data){
            if(err){
              console.log(err);
              callback(err);
            } else {
              callback(null, data);
            }
          });
        }
      });
    }, // end of updateContent
    addAnotation: function(page_id, anotation, callback){
      Page
        .update(
          {_id : page_id},
          {$push: {'anotations':anotation}},
          {upsert: false})
        .exec(function(err, data){
          if(err){
            console.log(err);
            callback('Грешка при запазването на анотацията.');
          } else {
            Page.findById(page_id, function(err, page){
              if(err){
                console.log(err);
              } else {
                callback(null, page.anotations);
              }
            });
          }
        });
    }, // end of addAnotation
    deleteAnotation: function(page_id, anotation_index, callback){
      Page.findOne({_id: page_id}).exec(function(err, page){
        if(err){
          console.log(err);
          callback(err);
        } else {
          page.anotations.splice(anotation_index, 1);
          page.save(function(err, page){
            if(err){
              console.log(err);
              callback(err);
            } else {
              callback();
            }
          });
        }
      });
    }, // end of deleteAnotation
  }; // end of return object
}; // end of module.exports
var textToHTML = function(text){
  return text.replace(/\r?\n/g, '<br />');
};

var prepareHTML = function(html, callback){
  var $ = cheerio.load(html);
  // remove all script taggs
  $('script').each(function(){
    $(this).replaceWith('');
  });
  callback($.html());
};

var getPageData = function(link, callback){
  request(link, function(err, res, body){
    var data = unfluff(body);
    callback(data);
  });
};

var userEnteredEmail = function(data){
  User.findById(data._id).exec(function(err, user){
    if(err || !user){
      return false;
    } else {
      if(user.data.email){
        return true;
      } else {
        return false;
      }
    }
  });
};
