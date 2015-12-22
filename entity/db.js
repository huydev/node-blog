var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog');

module.exports = mongoose;