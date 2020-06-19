const sendgrid = require('sendgrid');
const helper = sendgrid.mail;
const keys = require('../config/keys');

class Mailer extends helper.Mail 
{
	constructor({ subject, recipients }, content) 
	{
		super();

		this.sgApi = sendgrid(keys.sendGridKey);

		// Email name you want show to the user. It can be anything.
		this.from_email = new helper.Email('no-reply@emaily.com');

		this.subject = subject;
		this.body = new helper.Content('text/html', content);

		// this.recipients will contain the list of email ids wrapped inside helper.Email().
		this.recipients = this.formatAddresses(recipients);

		// this.addContent() is a built-in function.
		this.addContent(this.body);
		
		this.addClickTracking();
		this.addRecipients();
	}

	formatAddresses(recipients) 
	{
		return recipients.map(({ email }) => 
		{
			return new helper.Email(email);
		});
	}

	addClickTracking() 
	{
		const trackingSettings = new helper.TrackingSettings();
		const clickTracking = new helper.ClickTracking(true, true);

		trackingSettings.setClickTracking(clickTracking);
		this.addTrackingSettings(trackingSettings);
	}

	addRecipients() 
	{
		const personalize = new helper.Personalization();

		this.recipients.forEach(recipient => 
		{
			personalize.addTo(recipient);
		});

		this.addPersonalization(personalize);
	}

	async send() 
	{
		const request = this.sgApi.emptyRequest(
		{
			method: 'POST',
			path: '/v3/mail/send',
			body: this.toJSON()
		});

		const response = await this.sgApi.API(request);
		
		return response;
	}
}

module.exports = Mailer;