const mongooose = require('mongoose');
const Schema = mongooose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new Schema({
    name: String,
    emailId: String,
    notes : [{
        type: Schema.Types.ObjectId,
        ref: 'Note'
    }],
    googleId: String
});

// this line will automatically add username and password field in our model
userSchema.plugin(passportLocalMongoose, {
    usernameUnique: false,
});

const User = mongooose.model('User', userSchema);

module.exports = User;