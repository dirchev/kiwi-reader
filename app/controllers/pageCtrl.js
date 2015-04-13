var User = require('../models/user');
var Page = require('../models/page');
var unfluff = require('unfluff');
var request = require('request');

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
            res.json({success:true, page: page});
          }
        });
    },
    create: function(req, res){
      var page_link = req.body.page_link;
      var page_data = getPageData(page_link);
      var page = new Page();
      page.title = page_data.title;
      page.image = page_data.image;
      page.content = textToHTML(page_data.text);
      page.link = page_data.canonicalLink;
      page.users = [];
      page.users.push(req.user._id);
      page.save(function(err){
        if(err){
          console.log(err);
          res.json({success:false, message:"Грешка при записването на страницата."});
        } else {
          res.json({success:true});
        }
      });

    },
    delete: function(req, res){
      var page_id = req.params.page_id;
      Page.findOne({_id: page_id, users: req.user._id}, function(err, page){
        if(page.users.length === 1){
          Page.remove({_id: file_id, users: req.user._id}, function(err, page){
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
  }; // end of return object
}; // end of module.exports
var textToHTML = function(text){
  return text.replace(/\r?\n/g, '<br />');
};

var getPageData = function(link){
  request(link, function(err, res, body){
    var data = unfluff(body);
    return data;
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
