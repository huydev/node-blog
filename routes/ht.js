var express = require('express');
var router = express.Router();
var fs = require('fs');

var Article = require('../entity/Article');
var config = require('../config');

var multer = require('multer');  //文件上传
var upload = multer({
  dest: 'uploads/',
  // 设定限制，每次最多上传1个文件，文件大小不超过1MB
  limits: {fileSize: 1000000, files:1},
})

router.get('/', function(req, res){
  if(req.session.isLogin == 1){
    res.redirect('/ht/index');
  }else{
    res.render('back_login.html');
  }
});

//后台登录
router.post('/', function(req, res){
  var username = req.body.username;
  var pwd = req.body.pwd;
  if(username === '' || pwd === ''){
    res.json({
      status: 0,
      msg: '用户名或密码不能为空'
    });
  }
  if(username === 'admin' && pwd === 'admin'){
    req.session.isLogin = 1;
    res.json({
      status: 1,
      msg: '登录成功'
    });
  }else{
    res.json({
      status: -1,
      msg: '用户名或密码错误'
    });
  }
});

//退出登录
router.get('/exit', function(req, res){
  req.session.destroy(function(err){
    if(err) return console.error(err);
    res.redirect('/ht');
  });
});

//文章管理&主页设置
router.get('/index', checkLogin);
router.get('/index', function(req, res){
  var page = parseInt(req.query.page || 1);
  console.log(page);
  var limit = config.back_limit;

  Article.find({}).sort({ createTime: -1 })
    .limit(limit).skip((page-1) * limit)
    .exec(function(err, articles){
      Article.getCount(function(err, count){
        res.render('back_index.html', {
          page_title: '主页设置',
          articles: articles,
          page: page,
          countPage: Math.ceil(count / limit)
        });
      });
      /*res.render('back_index.html', {
        articles: articles,
        total: Article.getCount()
      });*/
    });
});
router.get('/newarticle', checkLogin);
router.get('/newarticle', function(req, res){
  res.render('back_newarticle.html', {
    page_title: '新增文章'
  });
});

//留言管理
router.get('/comment/:id', checkLogin);
router.get('/comment/:id', function(req, res){
  var id = req.params.id;
  Article.findById(id, 'comments', function(err, article){
    if(err) return console.error(err);
    res.render('back_comment.html', {
      page_title: '评论管理',
      article: article
    });
  });
});
router.get('/comment/:id', checkLogin);
router.get('/comment/delete/:id', function(req, res){
  var id = req.params.id;
  var commentId = req.query.commentId;
  Article.findByIdAndUpdate(id, {$pull: {comments: {_id: commentId}}}, function(err, article){
    if(err){
      console.error(err);
      return res.json({
        status: -1,
        msg: '错误' + err
      });
    }
    res.json({
      status: 1,
      msg: '删除成功'
    });
  });
});
router.get('/comment/deleteAll/:id', function(req, res){
  var id = req.params.id;
  Article.findByIdAndUpdate(id, {$set: {comments: []}}, function(err, article){
    if(err){
      console.error(err);
      return res.json({
        status: -1,
        msg: '错误' + err
      });
    }
    res.json({
      status: 1,
      msg: '删除所有成功'
    });
  });
});

//文章操作(/:id 会匹配 /comment 需要修改)
router.get('/p/:id', checkLogin);
router.get('/p/:id', function(req, res){
  var optcode = parseInt(req.query.optcode);
  var id = req.params.id;

  if(optcode){
    switch(optcode){
      case 1:
        Article.findById(id, function(err, article){
          if(err) return console.error(err);
          console.log(article);
          res.render('back_editarticle.html', {
            page_title: '文章预览',
            optcode: 1,
            article: article
          });
        });
        break;
      case 2:
        Article.findById(id, function(err, article){
          if(err) return console.error(err);
          res.render('back_editarticle.html', {
            page_title: '文章编辑',
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

function checkLogin(req, res, next){
  if(req.session.isLogin == 1){
    next();
  }else{
    res.redirect('/ht');
  }
}

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