var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

// Load .env if it exists. 
require("dotenv").config();

var app = express();

// DefaultAzureCredential expects AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET to be loaded as env vars
// or else use ManagedIdentityCredential
const credential = new DefaultAzureCredential();
const url = process.env["KEYVAULT_URI"] || "<keyvault-uri>";
const client = new SecretClient(url, credential);

// get a secret
const getWebChatSecret = async() => {
  const sec = await client.getSecret('WebChatSecretKey');
  console.log("***SECRET: ", sec.value);

  return sec;
}

const webChatSecret = getWebChatSecret();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
