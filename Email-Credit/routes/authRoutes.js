const passport = require('passport');

module.exports = app => 
{
	app.get('/auth/google', passport.authenticate('google', 
	{
		scope: ['profile', 'email']
	}));

	app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => 
	{
		// This will redirected to the 'http://localhost:3000/surveys' instead of 'http://localhost:5000/surveys' as the callback url you
		// have given is 'http://localhost:3000/auth/google/callback' i.e domain is localhost:3000. You can provide one more callback url
		// in your google account as 'http://localhost:5000/auth/google/callback' if you want redirect to domain name localhost:5000.

		res.redirect('/surveys');

		// If you want redirect to domain name localhost:5000
		// res.redirect('http://localhost:5000/surveys');
	});

	app.get('/api/logout', (req, res) => 
	{
		req.logout();
		
		res.redirect('/');
	});

	app.get('/api/current_user', (req, res) => 
	{	
		res.send(req.user);
	});
}