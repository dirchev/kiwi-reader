var User = require('../models/user');
var Book = require('../models/book');
var Page = require('../models/page');
var File = require('../models/file');
var Project = require('../models/project');

module.exports = {
  getUserProjects: function(req, res){
    var user = req.user;
    Project
      .find({'users' : user._id})
      .populate('users', 'data.name data.email')
      .exec(function(err, projects){
        if(err){
          res.json({success:false, message: 'Грешка при взимането на проектите.'});
        } else {
          res.json({success:true, projects:projects});
        }
      });
  },
  getProject: function(req, res){
    var project_id = req.params.project_id;
    var user = req.user;
    Project
      .find({'users':user._id, _id : project_id })
      .populate('users', 'data.name data.email')
      .populate('files books pages')
      .exec(function(err, project){
        if(err){
          console.log("Error while getting project: " + err);
          res.json({success:false, message:'Грешка при взимането на информацията.'});
        } else if(!project){
          res.json({success:false, message:'Проектът не беше намерен.'});
        } else {
          res.json({success:true, project:project});
        }
      });
  },
  renameProject: function(req, res){
    var user = req.user;
    var projcet_id = req.params.project_id;
    var newTitle = req.body.title;
    Project.update(
      {_id: project_id, users:user._id},
      {title : newTitle},
      {},
      function(err){
        if(err){
          console.log('Error while updating project: ' + err);
          res.json({success:false, message:"Възникна проблем при преименуването на проекта."});
        } else {
          res.json({success:true});
        }
      }
    );
  },
  addFile: function(req, res){
    var file_id = req.body.file_id;
    var project_id = req.params.project_id;
    var user = req.user;
    Project
      .findOne({_id: project_id, users: user._id})
      .exec(function(err, project){
        if(err){
          console.log("Error while getting project: " + err);
          res.json({success:false, message: "Грешка при взимането на данните за проекта."});
        } else if (!project) {
          res.json({success:false, message: "Проектът не беше намерен."});
        } else {
          // check if file already in project
          for(var i in project.files){
            if(project.files[i]._id === file_id){
              // if it is - send error message
              res.json({success:false, message: "Файлът вече е добавен в проекта."});
              break;
            }
          }
          // if not - push new id to project files and save
          project.files.push(file_id);
          project.save(function(err){
            if(err){
              console.log("Error while saving project: " + err);
              res.json({success:false, message: "Възникна грешка при запазването на проекта."});
            } else {
              res.json({success:true});
            }
          });
        }
      });
  }
};
