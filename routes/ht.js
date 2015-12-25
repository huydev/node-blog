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

//文章管理&主页设置
router.get('/index', function(req, res){
  Article.find({}).sort({ createTime: -1 })
    .limit(10).skip(0)
    .exec(function(err, articles){
      Article.getCount(function(err, count){
        res.render('back_index.html', {
          articles: articles,
          total: count
        });
      });
      /*res.render('back_index.html', {
        articles: articles,
        total: Article.getCount()
      });*/
    });
});

router.get('/newarticle', function(req, res){
  res.render('back_newarticle.html');
});

//文章操作
router.get('/:id', function(req, res){
  var optcode = parseInt(req.query.optcode);
  var id = req.params.id;

  if(optcode){
    switch(optcode){
      case 1:
        Article.findById(id, function(err, article){
          if(err) return console.error(err);
          console.log(article);
          res.render('back_editarticle.html', {
            optcode: 1,
            article: article
          });
        });
        break;
      case 2:
        Article.findById(id, function(err, article){
          if(err) return console.error(err);
          console.log(article);
          res.render('back_editarticle.html', {
            optcode: 2,
            article: article
          });
        });
        break;
      case 3:
        Article.findByIdAndRemove(id, function(err){
          if(err){
            res.json({
              status: -1,
              msg: err + ''
            });
          }else{
            res.json({
              status: 1,
              msg: '删除成功'
            });
          }
        });
        break;
      default:
        console.log('optcode Error');
        res.redirect('/ht/index');
    }
  }
});

//新建文章
router.post('/addarticle', function(req, res){
  Article.create({
    title: req.body.title,
    tags: req.body['tags[]'],
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
  //res.json({status: 1,msg: '保存成功'});
});
router.post('/editarticle', function(req, res){

  var id = req.body.id;
  var content = req.body.content;
  Article.update({_id: id}, {
    $set: {content: content}
  }, function(err, article){
    if(err){
      return res.json({
        status: -1,
        msg: '更新失败，Error: ' + err
      });
    }
    res.json({
      status: 1,
      msg: '更新成功'
    });

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