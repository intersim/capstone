'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('lodash');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    websites: {
        type: String
    },
    image: {
        type: String
    },
    following:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    bucket: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loop'
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mix'
    }],
    email: {
        type: String
    },
    password: {
        type: String
    },
    salt: {
        type: String
    },
    twitter: {
        id: String,
        username: String,
        token: String,
        tokenSecret: String
    },
    facebook: {
        id: String
    },
    google: {
        id: String
    },
    soundcloud: {
        id: String
    },
    joinDate: {
        type: Date,
        default: Date.now
    }
});

UserSchema.methods.findLoops = function() {
    return mongoose.model('Loop').find({creator: this._id})
}

// method to remove sensitive information from user objects before sending them out
UserSchema.methods.sanitize =  function () {
    return _.omit(this.toJSON(), ['password', 'salt']);
};

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function (plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};

UserSchema.pre('save', function (next) {

    if (this.isModified('password')) {
        this.salt = this.constructor.generateSalt();
        this.password = this.constructor.encryptPassword(this.password, this.salt);
    }

    next();

});

UserSchema.statics.generateSalt = generateSalt;
UserSchema.statics.encryptPassword = encryptPassword;

UserSchema.method('correctPassword', function (candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

module.exports = mongoose.model('User', UserSchema);
