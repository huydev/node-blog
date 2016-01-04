var mongoose = require('./db');

var moment = require('moment');

var config = require('../config.js');

var CommentSchema = mongoose.Schema({
  nick: String,
  email: String,
  website: String,
  content: String,
  ip: String,
  createTime: Date
});

CommentSchema.virtual('formatTime').get(function(){
  var time = moment(this.createTime).format("YYYY-MM-DD HH:mm:ss");
  return time;
});

var ArticleSchema = mongoose.Schema({
  title: { type: String, index: true },
  tags: { type: [String], index: true },
  content: String,
  comments: { type: [CommentSchema], index: true },
  views: {type: Number, default: 0},
  createTime: { type: Date, index: true }
}, { collection: 'articles' });

//数量
ArticleSchema.statics.getCount = function(cb){
  this.find({}).count(function(err, count){
    if(err) return cb(err);
    return cb(null, count);
  });
}

//得到所有标签
ArticleSchema.statics.getTags = function(cb){
  this.find({}, 'tags', function(err, result){
    if(err) return cb(err);
    var tags = [];
    result.forEach(function(tagArr){
      tagArr.tags.forEach(function(tag){
        if(tags.indexOf(tag) === -1){
          tags.push(tag);
        }
      });
    });
    return cb(null, tags);
  });
}

//搜索
ArticleSchema.statics.search = function(key, page, cb){
  var pattern = new RegExp(key, "i");
  this.find({title: pattern}, 'title createTime').sort({ createTime: -1 })
    .limit(config.qlimit).skip( (page-1)*config.qlimit )
    .exec(function(err, articles){
      if(err) return cb(err);
      return cb(null, articles);
    });
}

ArticleSchema.virtual('formatTime').get(function(){
  var time = moment(this.createTime).format("YYYY-MM-DD");
  return time;
});

ArticleSchema.virtual('formatTags').get(function(){
  var newTags = this.tags.join(' ');
  return newTags;
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;