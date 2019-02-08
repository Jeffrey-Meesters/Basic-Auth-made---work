const auth = require('basic-auth');
const User = require("../../database/models").User;
const bcrypt = require('bcrypt');

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
                    next();
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
