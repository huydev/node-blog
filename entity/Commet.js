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

module.exports = CommentSchema;