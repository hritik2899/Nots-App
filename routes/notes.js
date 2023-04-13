const express = require('express');
const router = express.Router();
const Note = require('../models/note');
const User = require('../models/user');
const { isLoggedIn } = require('../middleware/middleware');
const asyncError = require('../utilities/asyncError');
const {validateNote} = require('../middleware/middleware');
const ExpressError = require('../utilities/expressError');
const {date, time} = require('../utilities/dateAndTime');


router.get('/notes/:userId', isLoggedIn, asyncError(async (req, res) => {
    // home page logic

    const { userId } = req.params;
    const user = await User.findById(userId).populate('notes');
    // console.log(user);
    // req.currentUser = user;
    let firsttime = true;
    res.render('homePage', { userId, notearr: user.notes, user, firsttime, currentUser: user });
}))

router.get('/notes/:userId/search', asyncError(async(req, res) => {
    // LOGIC TO FIND THE NOTE ACCORDING TO THE SEARCH INPUT
    const {userId} = req.params;
    const {searchinput} = req.query;
    const user =  await User.findById(userId).populate('notes');

    const results = user.notes.filter(currnote => {
        if (currnote.title.includes(searchinput) || currnote.body.includes(searchinput)) {
            return true;
        }
    })
    const firsttime = false;
    res.render(`homePage`, {userId, notearr: results, user, searchinput, firsttime, currentUser: user});
    
}))

router.post('/notes/:userId', isLoggedIn, validateNote ,asyncError(async (req, res) => {
    // to add a new note

    const { userId } = req.params;
    const { title, note } = req.body;
    const currDate = date();
    const currTime = time();
    const newNote = new Note({ title: title, body: note, lastActivityDate: currDate, lastActivityTime: currTime })
    await newNote.save();
    const newNoteId = newNote._id;
    // res.send(newNoteId);
    const user = await User.findById(userId);
    // console.log(user);
    user.notes.push(newNote);
    await user.save();
    req.flash('success', 'New note added successfully !');
    res.redirect(`/notes/${userId}`);
}))

router.put('/notes/:userId/:noteId', isLoggedIn, asyncError(async (req, res) => {

    const {userId, noteId} = req.params;
    const {newtitle, newnote} = req.body;
    const reqNote = await Note.findById(noteId);
    reqNote.title = newtitle;
    reqNote.body = newnote;
    const currDate = date();
    const currTime = time();
    reqNote.lastActivityDate = currDate;
    reqNote.lastActivityTime = currTime;
    await reqNote.save();
    req.flash('success', 'Note edited successfully !');
    res.redirect(`/notes/${userId}`);
}))

router.delete('/notes/:userId/:noteId', isLoggedIn, asyncError(async (req, res) => {

    const {userId, noteId} = req.params;
    const reqNote = await Note.findByIdAndDelete(noteId);
    req.flash('error', "Note deleted successfully !");
    res.redirect(`/notes/${userId}`);
}))

module.exports = router;