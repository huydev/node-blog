var express = require('express');
var router = express.Router();

var markdown = require('markdown').markdown;
var Article = require('../entity/Article');

router.get('/', function(req, res){
	var page = req.query.page;
	page = page || 1;

	Article.find({}).sort({ createTime: -1 })
    .limit(10).skip( (page-1)*10 )
    .exec(function(err, articles){
    	if(err) return console.err(err);

    	var smallArticles = [];
    	articles.forEach(function(article){
    		smallArticles.push({
    			_id: article._id,
    			title: article.title,
    			content: markdown.toHTML(contentHandler(article.content)),
    			formatTime: article.formatTime
    		});
    	});
    	res.render('index', {
    		articles: smallArticles
    	});
    });
});
router.get('/p/:id', function(req, res){
  var id = req.params.id;
  Article.findById(id, function(err, article){
  	if(err) return console.error(err);
  	var article = {
  		_id: article._id,
  		title: article.title,
  		content: markdown.toHTML(unescape(article.content)),
  		formatTime: article.formatTime,
  		views: article.views,
  		tags: article.tags,
  		formatTags: article.formatTags
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

function contentHandler(content){
	var reg = /^!\[\]\(\S+\.(jpg|jpeg|png|gif)\)$/gm;
	var content = unescape(content);
	return content.replace(reg, '');
}

module.exports = router;