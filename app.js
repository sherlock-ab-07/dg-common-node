var express = require('express');
var createError = require('http-errors');
const cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
// Socekt IO for the socket commmunication
const { mongo, fleet } = require('./dg-common-app/utility');
/**Mongo Init**/
mongo.init();
fleet.init();

// metadata related controller
const commonRouter = require('./dg-common-app/controller/common-controller');
const metadataRouter = require('./dg-common-app/controller/metadata-controller');

//beneficiary controller
const userRouter = require('./dg-common-app/controller/user-controller');
const beneficiaryRouter = require('./dg-common-app/controller/beneficiary-controller');
const groupRouter = require('./dg-common-app/controller/group-controller');

// E - Locks controller
const containerRouter = require('./dg-common-app/controller/container-controller');
const tripRouter = require('./dg-common-app/controller/trip-controller');
const companyRouter = require('./dg-common-app/controller/company-controller');
const routeRouter = require('./dg-common-app/controller/route-controller');
// Lite controllers
const liteUserRouter = require('./dg-common-app/controller/lite-user-controller');
const liteTicketRouter = require('./dg-common-app/controller/lite-ticket-controller');
const liteDeviceRouter = require('./dg-common-app/controller/lite-device-controller');
const liteUserTrackingRouter = require('./dg-common-app/controller/lite-user-tracking-controller');

// Common Controllers
const carrierRouter = require('./dg-common-app/controller/carrier-controller');
const simcardRouter = require('./dg-common-app/controller/simcard-controller');
const authRouter = require('./dg-common-app/controller/auth-controller');
const deviceRouter = require('./dg-common-app/controller/device-controller');
const ticketRouter = require('./dg-common-app/controller/ticket-controller');

const searchRouter = require('./dg-common-app/controller/search-controller');

var app = express();
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
var whiteList = [
  'http://localhost:4200',
  'http://sofiadev.fennix360.com:4200',
  '13.57.50.187:4200',
];
// var checkOrigin = function(req.headers.origin){
//     // function (origin, callback) {
//         whiteList.indexOf(origin) !== -1
//         // callback(null, isWhitelisted);
//     // }
// };
// var whitelist = ['http://example1.com', 'http://example2.com']
// var corsOptions = {
//     origin: 'http://sofiadev.fennix360.com:4200',
//     credentials: true
// };
//     function (origin, callback) {
//     if (whiteList.indexOf(origin) !== -1) {
//         callback(null, true)
//     } else {
//         callback(new Error('Not allowed by CORS'))
//     }
// }

// var corsOptions = {
//     origin: ,
//     credentials: true
// };
// corsOptions
app.use(cors());
app.options('*', cors());
app.use(function(req, res, next) {
  const origin = req.headers.origin;
  if (whiteList.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, GET, PATCH, DELETE, OPTIONS',
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'x-sofia-auth');
  next();
});

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/metadata', metadataRouter);
app.use('/ticket', ticketRouter);
app.use('/device', deviceRouter);
app.use('/beneficiary', beneficiaryRouter);
app.use('/common', commonRouter);
app.use('/company', companyRouter);
app.use('/trip', tripRouter);
app.use('/carrier', carrierRouter);
app.use('/simcard', simcardRouter);
app.use('/group', groupRouter);
app.use('/container', containerRouter);
app.use('/route', routeRouter);
app.use('/search', searchRouter);
app.use('/lite', [
  liteUserRouter,
  liteTicketRouter,
  liteDeviceRouter,
  liteUserTrackingRouter,
]);

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
  // res.render('error');
});

module.exports = app;
