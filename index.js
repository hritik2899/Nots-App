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
\

const MyComponent = () => {
  const [input1Value, setInput1Value] = useState('');
  const [input2Value, setInput2Value] = useState('');
  const [showTable, setShowTable] = useState(false);

  const options1 = ['Option 1', 'Option 2', 'Option 3'];
  const options2 = ['Option A', 'Option B', 'Option C'];

  const handleInput1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput1Value(event.target.value);
    setInput2Value('');
    setShowTable(false);
  };

  const handleInput2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput2Value(event.target.value);
    setShowTable(false);
  };

  const handleButtonClick = () => {
    setShowTable(true);
  };

  return (
    <div>
      <h1>My Component</h1>
      <div>
        <label>Input 1:</label>
        <select value={input1Value} onChange={handleInput1Change}>
          <option value="">Select an option</option>
          {options1.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Input 2:</label>
        <select
          value={input2Value}
          onChange={handleInput2Change}
          disabled={!input1Value}
        >
          <option value="">Select an option</option>
          {options2.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleButtonClick} disabled={!input1Value || !input2Value}>
        Show Table
      </button>
      {showTable && (
        <table>
          <thead>
            <tr>
              <th>{input1Value}</th>
              <th>{input2Value}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data 1</td>
              <td>Data 2</td>
            </tr>
            <tr>
              <td>Data 3</td>
              <td>Data 4</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyComponent;
import React, { useState } from 'react';
import { css } from '@emotion/react';
import { ClipLoader } from 'react-spinners';

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const MyComponent = () => {
  const [input1Value, setInput1Value] = useState('');
  const [input2Value, setInput2Value] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const options1 = ['Option 1', 'Option 2', 'Option 3'];
  const options2 = ['Option A', 'Option B', 'Option C'];

  const handleInput1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput1Value(event.target.value);
    setInput2Value('');
    setShowTable(false);
  };

  const handleInput2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput2Value(event.target.value);
    setShowTable(false);
  };

  const handleContinueButtonClick = () => {
    setIsLoading(true);

    // Simulating a server request with a setTimeout
    setTimeout(() => {
      setIsLoading(false);
      setShowTable(true);
    }, 2000);
  };

  return (
    <div>
      <h1>My Component</h1>
      <div>
        <label>Input 1:</label>
        <select value={input1Value} onChange={handleInput1Change}>
          <option value="">Select an option</option>
          {options1.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Input 2:</label>
        <select
          value={input2Value}
          onChange={handleInput2Change}
          disabled={!input1Value}
        >
          <option value="">Select an option</option>
          {options2.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleContinueButtonClick}
        disabled={!input1Value || !input2Value}
      >
        Continue
      </button>
      {isLoading && (
        <div className="loading-icon">
          <ClipLoader css={override} size={50} color={'#123abc'} loading={true} />
        </div>
      )}
      {showTable && (
        <table>
          <thead>
            <tr>
              <th>{input1Value}</th>
              <th>{input2Value}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data 1</td>
              <td>Data 2</td>
            </tr>
            <tr>
              <td>Data 3</td>
              <td>Data 4</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyComponent;


ALTER TABLE your_table ALTER COLUMN id TYPE UUID USING (gen_random_uuid());
SELECT CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_NAME = 'mine' AND CONSTRAINT_TYPE = 'PRIMARY KEY';
