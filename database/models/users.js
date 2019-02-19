'use strict'

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Name_is_required"
                },
                isUnique: function(value, next) {

                    User.findOne({
                        where: {name: value},
                        attributes: ['id']
                    })
                        .done(function(user, err) {

                            if (err) {
                                // Some unexpected error occured with the find method.
                                const error = new Error('Error when checking for uniqueness', err)
                                error.status = 404;
                                return next(error);
                            }

                            if (user) {
                                // We found a user with this name.
                                // Pass the error to the next method.
                                const error = new Error("Use another username");
                                error.status = 409;
                                return next(error);
                            }
                            // If we got this far, the name hasn't been used yet.
                            // Call next with no arguments when validation is successful.
                            next();

                        });

                }
            },
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Email_is_required"
                },
                isUnique: function(value, next) {

                    User.findOne({
                        where: {email: value},
                        attributes: ['id']
                    })
                        .done(function(user, err) {

                            if (err) {
                                // Some unexpected error occured with the find method.
                                const error = new Error('Error when checking for uniqueness', err)
                                error.status = 404;
                                return next(error);
                            }

                            if (user) {
                                // We found a user with this name.
                                // Pass the error to the next method.
                                const error = new Error("Use another email address");
                                error.status = 409;
                                return next(error);
                            }
                            // If we got this far, the name hasn't been used yet.
                            // Call next with no arguments when validation is successful.
                            next();

                        });

                },
                isEmail: true
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Password_is_required"
                },
            },
        }
    }, {
        validate: {
            passLenght() {
                if (this.password.length !== 60) {
                    // the password is hashed to a 60 digit random string
                    // if not something has changed or went wrong
                    throw new Error("Something unexpected went wrong creating your password, please contact website owner. Do <strong>NOT</strong> provide your password!")
                }
            }
        }
    })

    return User;
}
