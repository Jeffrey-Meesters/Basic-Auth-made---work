const auth = require('basic-auth');
const User = require("../../database/models").User;
const bcrypt = require('bcrypt');

const createCookie = function(res, next, credentials) {
    bcrypt.hash(`${credentials.name}`, 10, function(err, hash) {
        if (err) {
            console.log('Cookie hash breaks!!', err)
            const error = new Error("Cookie hashing breaks!!");
            error.status = 500;
            return  next(error);
        }

        const options = {
            maxAge: 1000 * 60 * 15, // 15 minutes
            httpOnly: true,
            signed: true
        }

        res.cookie(`aTok`, hash, options);
        next();
    })
}

exports.authy = (req, res, next) => {
    const credentials = auth(req)
    const cookie = req.cookies;

    if (cookie) {
        console.log(req.cookies)
    }

    if (credentials) {

        User.findOne({
            where: {email: credentials.name}
        }).done(function(user, error) {

            if (error) {
                console.warn('error in DB search');
                res.status(401).json({message: 'Access Denied'})
            }

            if (user) {
                // We found a user with this email address.
                const authenticated = bcrypt.compareSync(credentials.pass, user.password);

                if (!authenticated) {
                    res.status(401).json({message: 'Access Denied'})
                } else {
                    req.currentUser = user;
                    createCookie(res, next, credentials);
                }

            } else {
                console.warn('user not found');
                res.status(401).json({message: 'Access Denied'})
            }
        })
    } else {
        console.warn('Auth header not found');
        res.status(401).json({message: 'Access Denied'})
    }
}
