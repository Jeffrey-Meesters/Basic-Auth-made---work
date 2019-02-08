'use strict';

// https://expressjs.com/en/4x/api.html
const express = require('express');

// http://docs.sequelizejs.com/
const sequelize = require('../database/models').sequelize;

// https://github.com/expressjs/body-parser
const bodyParser = require('body-parser');

// require routes
const routes = require("./routes/index");

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

const app = express();

// parse application/json
app.use(bodyParser.json());

// all routes will start with '/api'
app.use('/api', routes);

// send 404 if no other route matched
app.use((req, res) => {
    res.status(404).json({
        message: 'Route Not Found',
    });
});

// setup a global error handler
app.use((err, req, res, next) => {
    if (enableGlobalErrorLogging) {
        console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
    }

    res.status(err.status || 500).json({
        message: err.message,
        error: {},
    });
});

// set our port
app.set('port', process.env.PORT || 5000);

// Call sync on sequelize before starting the server
// So the Database gets initialized
sequelize.sync().then(function() {
    const server = app.listen(app.get('port'), () => {
        if (server.address().port === 5000) {
            console.log(`Express server is listening on port http://localhost:${server.address().port}`);
        } else {
            console.log(`Express server is listening on port ${server.address().port}`);
        }
    });
});
