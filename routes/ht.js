var express = require('express');
var router = express.Router();
var fs = require('fs');

var Article = require('../entity/Article');

var multer = require('multer');  //文件上传
var upload = multer({
  dest: 'uploads/',
  // 设定限制，每次最多上传1个文件，文件大小不超过1MB
  limits: {fileSize: 1000000, files:1},
})

router.get('/', function(req, res){
  res.render('back_login.html');
});
router.get('/index', function(req, res){
  res.render('back_index.html');
});
router.get('/newarticle', function(req, res){
  res.render('back_newarticle.html');
});

//新建文章
router.post('/addarticle', function(req, res){
  Article.create({
    title: req.body.title,
    tags: req.body.tags,
    content: req.body.content,
    createTime: new Date()
  }, function(err, article){
    if(err){
      res.json({
        status: 0,
        msg: err + ''
      });
    }else{
      res.json({
        status: 1,
        msg: '保存成功'
      });
    }
  });
});


//上传操作
/*router.post('/uploadImg', upload.single('imgFile'), function(req, res){
  var fileObj = req.file;
  console.log(fileObj);
  fs.readFile(fileObj.path, function(err, data){
    fs.writeFile('public/assets/'+fileObj.originalname, data, function(err){
      console.log('保存成功');
    });
  });
  res.json({
    status: 1,
    msg: '上传成功'
  });
});*/

module.exports = router;