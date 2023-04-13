const e = require('connect-flash');
const { notesSchema, usersSchema } = require('../joi/schema');
const ExpressError = require('../utilities/expressError');

module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.user);
    // console.log(req.session.bypass);
    if(req.session.bypass === true){
        return next();
    }
    if(!req.user){
        req.flash('error', 'User must be signed-In');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateNote = (req, res, next) => {
    const {error} = notesSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    }
    else next();
}

module.exports.validateUser = (req, res, next) => {
    const {email, name} = req.body;
    const {error} = usersSchema.validate({email: email, name: name});
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}