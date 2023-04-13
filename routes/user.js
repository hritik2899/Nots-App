const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const asyncError = require('../utilities/asyncError');
const {validateUser} = require('../middleware/middleware');


router.get('/login', (req, res) => {
    // FOR RENDERING THE LOGIN FORM
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/register' }), (req, res) => {

    let userId = req.user._id;
    let userName = req.user.name;
    req.flash('success', `Welcome back ${userName} !`);
    res.redirect(`/notes/${userId}`);
})


router.get("/login/google", passport.authenticate("google", {scope: ["profile", "email"]}));

router.get("/login/google/redirect", passport.authenticate('google', {failureRedirect: '/register'}), async (req, res) => {
    let userId = req.user._id;
    
    req.session.currentUser = req.user;
    req.session.bypass = true;
    res.redirect(`/notes/${userId}`);
});


router.get('/register', (req, res) => {
    // FOR RENDERING THE REGISTER FORM

    res.render('users/register');
})

router.post('/register', validateUser ,asyncError(async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        // LOGIC TO REGISTER A NEW USER
        const user = new User({ email: email, username: username, name: name });
        const newUser = await User.register(user, password);
        const userId = user._id;
        req.login(user, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', `Welcome to Notes-App ${name}`);
            res.redirect(`/notes/${userId}`);
        })

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}))

router.get('/logout', (req, res) => {
    // console.dir(req.user);
    req.session.bypass = false;
    req.session.currentUser = null;
    req.logout();
    req.flash('success', 'Logout successfully !');
    res.redirect('/');
})


module.exports = router;