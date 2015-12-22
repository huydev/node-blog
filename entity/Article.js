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
  createTime: Date
}, { collection: 'articles' });

ArticleSchema.virtual('formatTime').get(function(){
  var time = moment(this.createTime).format("YYYY-MM-DD");
  return time;
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;