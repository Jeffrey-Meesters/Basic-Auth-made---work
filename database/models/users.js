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
                        .done(function(user, error) {

                            if (error) {
                                // Some unexpected error occured with the find method.
                                return next(error);
                            }

                            if (user) {
                                // We found a user with this name.
                                // Pass the error to the next method.
                                return next('User already exists');
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
                isEmail: true
            },
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Password_is_required"
                }
            },
        }
    })

    return User;
}
