const express = require('express');
const loginRouter = express.Router();
const auth = require('@auth0/auth0-spa-js');
const bodyParser = require('body-parser');
loginRouter.use(bodyParser());
loginRouter.route('/login', async (req, res) => {});

module.exports = loginRouter;
