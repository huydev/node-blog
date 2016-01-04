var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();

//路由
var index = require('./routes/index');
var ht = require('./routes/ht');

//模版引擎设置
app.set('view engine', 'html');
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));

// icon 设置
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(session({
  secret: 'buxingnizhidao'
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

app.use('/', index);
app.use('/ht', ht);

// 50x
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// 404
app.use(function(req, res, next){
  res.status(404).send('404 Not Find. 没有更多的信息了，自己点浏览器返回按钮返回吧 ฅ(๑˙o˙๑)ฅ');
});

var server = app.listen(3000, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server listening at http://%s:%s', host, port);
});