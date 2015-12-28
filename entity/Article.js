var mongoose = require('./db');

var moment = require('moment');

var CommentSchema = mongoose.Schema({
  nick: String,
  email: String,
  website: String,
  content: String,
  createTime: Date
});

CommentSchema.virtual('formatTime').get(function(){
  var time = moment(this.createTime).format("YYYY-MM-DD HH:mm:ss");
  return time;
});

var ArticleSchema = mongoose.Schema({
  title: String,
  tags: [String],
  content: String,
  comments: [CommentSchema],
  views: {type: Number, default: 0},
  createTime: Date
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

ArticleSchema.virtual('formatTime').get(function(){
  var time = moment(this.createTime).format("YYYY-MM-DD");
  return time;
});

ArticleSchema.virtual('formatTags').get(function(){
  var newTags = this.tags.join(';');
  return newTags;
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;