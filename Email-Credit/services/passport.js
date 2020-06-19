const passport = require('passport');
const Google = require('passport-google-oauth20');
const mongoose = require('mongoose');
const keys = require('../config/keys');

const GoogleStrategy = Google.Strategy;
const User = mongoose.model('users');

passport.serializeUser((user, done) => 
{
  	done(null, user.id);
});

passport.deserializeUser((id, done) => 
{
	User.findById(id).then(user => 
	{
		done(null, user);
	});
});

passport.use(new GoogleStrategy(
{
	clientID: keys.googleClientID,
	clientSecret: keys.googleClientSecret,

	// This callbackURL should be same as the one you provided in your google account project. /auth/google/callback' --> This is the relative
	// path means total path --> http://localhost:3000/auth/google/callback'. 3000 ?? Don't know. So you should provide callback url in your
	// google account this one.
	callbackURL: '/auth/google/callback',
	proxy: true
},
async (accessToken, refreshToken, profile, done) => 
{
	const existingUser = await User.findOne({ googleId: profile.id });

	if(existingUser) 
	return done(null, existingUser);
	
	const user = await new User({ googleId: profile.id }).save();
	
	done(null, user);
}));