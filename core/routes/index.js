'use strict';

const express = require("express");
const router = express.Router();
var auth = require('basic-auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require("../../database/models").User;
const Sequelize = require('sequelize');

const authy = (req, res, next) => {
    const credentials = auth(req)

    if (credentials) {

        User.findOne({
            where: {email: credentials.name}
        }).done(function(user, error) {

            if (error) {
                console.warn('error in DB search');
                message = 'error in DB search';
            }

            if (user) {
                // We found a user with this email address.
                // Pass the error to the next method.
                const authenticated = bcrypt.compareSync(credentials.pass, user.password);

                if (!authenticated) {
                    res.status(401).json({message: 'Access Denied'})
                } else {
                    req.currentUser = user;
                    next();
                }

            } else {
                message = 'User not found';
            }
        })
    } else {
        message = 'Auth header not found';
    }
}

router.get('/log-in', (req, res, next) => {
    res.json({message: 'Welcome!'})
})

router.post('/log-in', authy, (req, res, next) => {
    res.json({message: 'Welcome! you have logged in'})
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
