//Main starting point of the app
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const mongoose = require('mongoose');

//connect to mongoDb
mongoose.connect('mongodb://localhost:auth/auth');

// Use bluebird
mongoose.Promise = require('bluebird');

//App Setup
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
router(app);

//Server Setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);

server.listen(port);

console.log(`Server listening on: ${port}`);
