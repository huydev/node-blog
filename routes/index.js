var express = require('express');
var router = express.Router();

var markdown = require('markdown').markdown;
var Article = require('../entity/Article');
var config = require('../config');
var xss = require('xss');

router.get('/', function(req, res){
	var page = req.query.page || 1;
  var limit = config.limit;
  Article.getCount(function(err, count){
    if(err) console.err(err);

  	Article.find({}).sort({ createTime: -1 })
      .limit(limit).skip( (page-1)*limit )
      .exec(function(err, articles){
      	if(err) return console.err(err);
      	var smallArticles = [];
      	articles.forEach(function(article){
          var content = unescape(article.content).split(/<!--\s?more\s?-->/)[0];
      		smallArticles.push({
      			_id: article._id,
      			title: article.title,
      			content: markdown.toHTML(content),
      			formatTime: article.formatTime
      		});
      	});
      	res.render('index', {
      		articles: smallArticles,
          countPage: Math.ceil(count / limit),
          page: parseInt(page),
          limit: limit
      	});
      });
  });
});
router.get('/p/:id', function(req, res){
  var id = req.params.id;
  Article.findByIdAndUpdate(id, {$inc: {views: 1}}, function(err, article){
  	if(err) return console.error(err);
  	var article = {
  		_id: article._id,
  		title: article.title,
  		content: markdown.toHTML(unescape(article.content).replace(/<!--\s?more\s?-->/, '')),
  		formatTime: article.formatTime,
  		views: article.views,
  		tags: article.tags,
  		formatTags: article.formatTags,
      comments: article.comments.reverse()
  	}
  	res.render('entry', {
      article: article
    });
  });
  //res.render('entry');
});

//得到所有标签
router.get('/tags', function(req, res){
	Article.getTags(function(err, result){
		if(err) return console.err(err);
		res.json({
			tags: result
		})
	});
});

//添加评论
router.post('/addComment', function(req, res){
  var id = req.body.id;
  var nick = req.body.nick || '匿名人士';
  var website = req.body.website || 'javascript:;';
  var con = xss(req.body.con);
  var ip = req.ip;

  var data;
  if(con == ''){
    data = {
      status: 0,
      msg: '评论内容不能为空。'
    }
  }

  var comment = {
    nick: nick,
    website: website,
    content: con,
    ip: ip,
    createTime: new Date()
  }

  Article.update({_id: id},
    {$push: {comments: comment}},
    function(err, article){
      if(err) return console.error(err);
      data = {
        status: 1,
        msg: '评论成功。',
        article: article
      }
      res.json(data);
  });
});

//友情链接
router.get('/yqlink', function(req, res){
  res.json(config.yqlinks);
});

//搜索页
router.get('/search', function(req, res){
  var page = req.query.page || 1;
  var key = req.query.q;
  page = parseInt(page);
  var limit = config.qlimit;

  var pattern = new RegExp(key, "i");
  Article.find({title: pattern}).count(function(err, count){
    Article.search(key, page, function(err, articles){
      res.render('search', {
        articles: articles,
        countPage: Math.ceil(count / limit),
        page: parseInt(page)
      });
    });
  });
});

function contentHandler(content){
	var reg = /^!\[\]\(\S+\.(jpg|jpeg|png|gif)\)$/gm;
	var content = unescape(content);
	return content.replace(reg, '');
}

module.exports = router;