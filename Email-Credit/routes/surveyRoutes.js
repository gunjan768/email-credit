const _ = require('lodash');

// A small library to parse and build paths. It can be used to partially or fully test paths against a defined pattern.
const Path = require('path-parser');
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');
const MailService = require('../services/sendGridMail');

const Survey = mongoose.model('surveys');

module.exports = app => 
{
	app.get('/api/surveys', requireLogin, async (req, res) => 
	{
		// select() will allow you what to choose or what not to. If you want select any property (field) then write the field name
		// along with 'true' or '1' as a key-value pair. If you want to exclude the feature then mention that field as 'false' or '0'.
		// Here we don't want the 'recipients' field hence mentioned as false. Find will return the whole documnet that matches the 
		// given condition ( userId ) but it will exclude the field 'recipients' field.
		const surveys = await Survey.find({ _user: req.user.id }).select(
		{
			recipients: false
		});

		res.send(surveys);
	})

	app.get('/api/surveys/:surveyId/:choice', (req, res) => 
	{
		res.send('Thanks for voting!');
	})

	// app.post('/user/webhooks/event/test', (req, res) =>
	// {
	// 	console.log(req.body);
	// 	console.log("req.body");

	// 	return res.send(req.body);
	// })

	// This URL will be automatically called whenever the user clicks on the link which is sent to him/her through email.
	app.post('/api/surveys/webhooks', (req, res) => 
	{
		// Once console log the req body. req.body is an object which will contain email, url, event etc.

		// This is the path pattern. When user clicks on the link which is sent to him/her then the url mentioned on the link must match
		// with this path pattern.
		const pathPattern = new Path('/api/surveys/:surveyId/:choice');

		// chain() function let you write the series of functions in the chained manner. compact() will remove all the elements which are
		// undefined. uniqBy() will allow only the unique element where the uniqueness is defined by the properties which are passed as 
		// parameters. In the chain manner the result of one function is passed to the another. Result of map() will passed to compact()
		// and result of compact() will be passed to the uniqBy() and so on. value() will return the final array which you can store.
		_.chain(req.body).map(({ email, url }) => 
		{
			// This will takeout the pathname from the url leaving behind the domain name.
			const pathName = new URL(url).pathname;
			
			const match = pathPattern.test(pathName);

			if(match) 
			{
				return { 
					email, 
					surveyId: match.surveyId, 
					choice: match.choice 
				};
			}
		})
		.compact().uniqBy('email', 'surveyId').each(({ surveyId, email, choice }) => 
		{
			// updateOne() function used to update the fields of any one of the first matched document. It accepts two arguments : 1st -->
			// the fields which must match, 2nd --> the fields which you want update. 
			Survey.updateOne(
			{
				_id: surveyId,
				recipients: 
				{
					// $elemMatch is an operator which is used to match for matching. Here email prop must match with email and responded
					// should be false.
					$elemMatch: 
					{ 
						email: email, 
						responded: false 
					}
				}
			},
			{
				// $inc and $set are operators. $inc is used to increment the by the value mentioned ( here by 1 ). $set is used to set the
				// field to the value mentioned ( here by true ). Remember that choice will be either yes or no. 'recipients.$.responded' means 
				// look for the recipients sub document and inside the sub document update the responded property of the recipient which
				// matches. $ sign will be replaced with the index number of recipient matched ( recipients has many records so each one is 
				// assigned the index number starting from zero).
				$inc: { [choice]: 1 },
				$set: { 'recipients.$.responded': true },
				lastResponded: new Date()
				
			}).exec();
		}).value();

		res.send({});
	})

	app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => 
	{
		const { title, subject, body, recipients } = req.body;

		const survey = new Survey(
		{
			title,
			subject,
			body,
			recipients: recipients.split(',').map(email => ({ email: email.trim() })),
			_user: req.user.id,
			dateSent: Date.now()
		});
		
		try 
		{
			const messageBody =  MailService.prepareMails(survey, surveyTemplate(survey));
			
			await MailService.sendMail(messageBody);
			await survey.save();

			req.user.credits -= 1;

			const user = await req.user.save();

			return res.status(200).send(user);
		} 
		catch(error) 
		{
			return res.status(422).send(error);
		}
	})
}