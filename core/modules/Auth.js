const auth = require('basic-auth');
const User = require("../../database/models").User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const tokenSecret = "yolo";

const tokenCreator = (res, next, user) => {

    payload = {
        sub: user.name,
        name: "yolo"
    }

    jwt.sign(payload, tokenSecret, { expiresIn: '1h' });

    if (jwt) {
        console.log(jwt);
        res.status(200).json({'token': jwt});
    } else {
        const error = new Error("Something went wrong wile creating a token");
        error.status(500);
        next(error)
    }
}

exports.authy = (req, res, next) => {
    const credentials = auth(req)
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
                    tokenCreator(res, next, user)
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
