const path = require('path');
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config({ path: './config.env' });

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const lodgingRouter = require('./routes/lodgingRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const authRouter = require('./routes/authRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Implement CORS
app.use(cors());

app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// Loggin development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, read data from body
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cookieParser());

// NOSQL query injection
app.use(mongoSanitize());
app.use(xss());

// app.use(hpp({ whitelist: ['sort'] }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  // req.requestTime = new Date().toISOString();
  // console.log(req.query);
  next();
});

app.use('/api/v1/lodgings', lodgingRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/auth', authRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404, ''));
});

app.use(globalErrorHandler);

module.exports = app;
