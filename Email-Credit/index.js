const express = require('express');
const mongoose = require('mongoose');

// A user session can be stored in two main ways with cookies: on the server or on the client. This module stores the session data on the 
// client within a cookie, while a module like express-session stores only a session identifier on the client within a cookie and stores the 
// session data on the server, typically in a database.
const cookieSession = require('cookie-session');

const passport = require('passport');
const bodyParser = require('body-parser');
const keys = require('./config/keys');

require('./models/User');
require('./models/Survey');
require('./services/passport');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

const app = express();

app.use(bodyParser.json());

app.use(cookieSession(
{
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);
require('./routes/surveyRoutes')(app);

if(process.env.NODE_ENV === 'production') 
{
	// Express will serve up production assets like our main.js file, or main.css file!
	app.use(express.static('client/build'));

	// Express will serve up the index.html file if it doesn't recognize the route
	const path = require('path');

	app.get('*', (req, res) => 
	{
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

const PORT = 5000;

app.listen(PORT, () =>
{
	console.log("Server is running on port : ",PORT);
});