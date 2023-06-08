if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const localStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user');
const flash = require('connect-flash');
const ExpressError = require('./utilities/expressError');
const mongoSanitize = require('express-mongo-sanitize');

const MongoStore = require('connect-mongo');


const clientID = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/notes-app';
// const dbUrl = 'mongodb://localhost:27017/notes-app';
const SECRET = process.env.SECRET || 'thisisasecret';
// const SECRET = 'thisisasecret';

// const dbUrl = 'mongodb://localhost:27017/notes-app';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
})
    .then(() => {
        console.log('MONGOOSE CONNECTION OPEN');
    })
    .catch((err) => {
        console.log('IN MONGOOSE SOMETHING WENT WRONG', err);
    })

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: SECRET,
    touchAfter: 24 * 60 * 60
})

store.on('error', function (e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
      done(null, user);
    });
});

// GOOGLE AUTHENTIATION

passport.use(
    new GoogleStrategy(
        {
            clientID: clientID,
            clientSecret: clientSecret,
            callbackURL: "/login/google/redirect"
        }, (accessToken, refreshToken, profile, done) => {
            // console.log(profile);
            const displayName = profile.displayName
            const emailId = profile.emails[0].value;
            // passport callback function
            //check if user already exists in our db with the given profile ID
            User.findOne({ googleId: profile.id }).then((currentUser) => {
                if (currentUser) {
                    //if we already have a record with the given profile ID
                    done(null, currentUser);
                } else {
                    //if not, create a new user 
                    new User({
                        googleId: profile.id,
                        name: displayName,
                        emailId: emailId,
                        username: emailId,
                    }).save().then((newUser) => {
                        done(null, newUser);
                    });
                }
            })
        })
);

app.use(mongoSanitize());

const userRoutes = require('./routes/user')
const noteRoutes = require('./routes/notes');


app.use((req, res, next) => {
    // console.log(req.query);
    res.locals.User = req.session.currentUser;
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/', noteRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh NO , Something went wrong !";
    res.status(statusCode).render('error', { err });

})
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`LISTENING ON PORT ${port}`);
})
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Image, Table } from 'react-bootstrap';

// Your React component code
function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <Navbar bg={isDarkMode ? 'dark' : 'light'} variant={isDarkMode ? 'dark' : 'light'} expand="lg">
        <Navbar.Brand style={{ fontSize: '24px', paddingRight: '20px' }}>
          <Image src="logo.png" alt="Logo" className="mr-2" />
          My Website
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ml-auto">
            <div className="d-flex align-items-center">
              <Image
                src="user.png"
                alt="User"
                roundedCircle
                className="mr-2"
                style={{ width: '48px', height: '48px' }}
              />
              <span style={{ color: isDarkMode ? 'white' : 'black' }}>John Doe</span>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Table striped bordered hover variant={isDarkMode ? 'dark' : 'light'} className="mt-4 custom-table">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>John</td>
            <td>Doe</td>
            <td>john.doe</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jane</td>
            <td>Smith</td>
            <td>jane.smith</td>
          </tr>
          {/* Add more table rows as needed */}
        </tbody>
      </Table>

      {/* Your JSX/HTML content */}
      <div className="toggle-container mt-4">
        <span className="toggle-label">Toggle mode:</span>
        <label className="switch">
          <input type="checkbox" checked={isDarkMode} onChange={toggleMode} />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
}

export default App;

