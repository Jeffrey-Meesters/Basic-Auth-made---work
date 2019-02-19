'use strict';

const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require("../../database/models").User;
const Sequelize = require('sequelize');
const authy = require('../modules/auth').authy;

router.get('/log-in', (req, res, next) => {
    const user = req.user;
    if (user) {
        res.location('/api/users').sendStatus(200);
    } else {
        res.sendStatus(200);
    }
})

router.post('/log-in', authy, (req, res, next) => {
    const user = req.currentUser;

    if (user) {
        res.location('/api/users').sendStatus(200);
    } else {
        // If user is not defined then something went wrong while setting the data
        // Because when the code reaches this the user was authenticated, but not set.
        const error = new Error("Something unexpected happened");
        error.status = 500;
        next(error);
    }
})

router.post('/sign-up', (req, res, next) => {
    // Sequelize create user with the data in req.body
    // but first hash password
    const data = req.body;
    bcrypt.hash(data.password, saltRounds, function(err, hash) {

        if (!err) {
            if (data.password.length < 4) {
                const error = new Error("Your password must be at least 4 characters long");
                error.status = 422;
                return next(error);
            }

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
            .catch((err) => {
                // Else something else went wrong so throw error here
                const error = new Error('unexppected error happened when creating a new user:', err);
                error.status = 500;
                next(error)
            })
        } else {
            const error = new Error('unexppected error happened while hashing:', err);
            error.status = 500;
            next(error)
        }
    })
})

router.get('/user', authy, (req, res, next) => {
    const user = req.currentUser;

    if (user) {
        User.findOne({
            where: {email: user.email}
        }).done(function(user, error) {
            if(error) {
                const error = new Error("Could not find user info")
                error.status = 404;
                return next(404);
            }

            res.status(200).json({'data': user});
        });
    } else {
        // If user is not defined then something went wrong while setting the data
        // Because when the code reaches this the user was authenticated, but not set.
        const error = new Error("Something unexpected happened");
        error.status = 500;
        next(error);
    }
})

module.exports = router;
