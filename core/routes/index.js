'use strict';

const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require("../../database/models").User;
const Sequelize = require('sequelize');
const authy = require('../modules/auth').authy;

router.get('/log-in', (req, res, next) => {
    res.json({message: 'Welcome!'})
})

router.post('/log-in', authy, (req, res, next) => {
    res.json({message: 'Welcome! you have logged in. You can now go to /users'})
})

router.post('/sign-up', (req, res, next) => {
    // Sequelize create user with the data in req.body
    // but first hash password
    const data = req.body;
    bcrypt.hash(data.password, saltRounds, function(error, hash) {

        if (!error) {
            data.password = hash;

            User.create(data).then( (user)=> {
                if (user) {
                    console.log('user: ', user)
                    res.json({data: user})
                }
            })
            .catch(Sequelize.ValidationError, function (err) {
                // respond with validation errors
                return res.status(422).send(err.errors);
            })
            .catch((error) => {
                // Else something else went wrong so throw error here
                console.log('error when creating a new user')
                next(500)
            })
        } else {
            res.status(500)
            res.json(error);
        }
    })
})

router.get('/users', authy, (req, res, next) => {
    User.findAll().then((users) => {
        res.status(200);
        res.json({data: users});
    })
})

module.exports = router;
