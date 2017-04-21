var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    local : {
        username: String,
        password: String
    },
    signupDate: { type: Date, default: Date.now() },

    favorites: {
        color: String,
        luckyNumber: Number
    }
});

userSchema.methods.generateHash = function (password) {
    // Generate salted hash of plaintext password
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function (password) {
    // Create hash of password entered, compare to stored hash.
    // If hashes match, passwords were the same.
    return bcrypt.compareSync(password, this.local.password);
};

User = mongoose.model('User', userSchema);

module.exports = User;