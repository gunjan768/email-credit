const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const requireLogin = require('../middlewares/requireLogin');
const helper = require('../helper/helper');

module.exports = async app => 
{	
	app.post('/api/stripe', requireLogin, async (req, res) => 
	{
		let { paymentMethodID, paymentIntentID } = req.body;
		let paymentIntent;
		
		if(paymentIntentID !== undefined && paymentMethodID !== undefined)
		{
			return res.status(404).send({error: "Neither payment method id neither payment intent id is found"});
		}

		try
		{
			if(paymentMethodID !== undefined)
			{
				paymentMethodID = JSON.parse(paymentMethodID);
		
				paymentIntent = await stripe.paymentIntents.create(
				{
					amount: 1200,
					currency: 'inr',
					description: "Rs 120 for 120 points",
					payment_method: paymentMethodID,
					payment_method_types: ['card'],
					statement_descriptor: 'Custom descriptor',

					// when confirmation_method set to "manual" then we have to manually confirm the payment by using the manual confirm 
					// stripe method : stripe.paymentIntents.confirm(). It will set the status to "requires_confirmation" if your your 
					// card doesn't support or required 3D Secure or 'request_three_d_secure_'  option is not set. If 
					// 'request_three_d_secure' is set but your card doesn't support 3D secure then also it throws a status of 
					// "requires_confirmation".
					confirmation_method: "manual",

					payment_method_options: 
					{
						card:
						{
							request_three_d_secure: "any"
						}
					},

					// when confirm set to true then the paymentIntent.status will set to "succeeded" if 'request_three_d_secure' is not 
					// set else it throw a status of "requires_action".
					confirm: true,

					// metada is the collection of ket-value pairs and is used to store the any means of data.
					metadata: 
					{
						integration_check: 'accept_a_payment',
						puprose: "Loss credit and gain points"
					},

					// customer: 1234,
					// setup_future_usage: 'off_session',
					// Set to true only when using manual confirmation and the iOS or Android SDKs to handle additional authentication 
					// steps.
					use_stripe_sdk: true,
				});
			}
			else
			{
				paymentIntent = await stripe.paymentIntents.confirm(paymentIntentID);
				
				req.user.credits += 5;
				const user = await req.user.save(); 
			}
			
			return res.send(helper.generateResponse(paymentIntent));
		}
		catch(error)
		{
			return res.send({ error: error.message });
		}
	});

	app.post('/api/client_secret', requireLogin, async (req, res) =>
	{
		let { paymentIntentID } = req.body;	
		
		// Retrieves the details of a PaymentIntent that has previously been created.
		const retrievePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);

		// console.log(retrievePaymentIntent)
		
		return res.send({ clientSecret: retrievePaymentIntent.client_secret });
	})

	app.post('/api/cancel_payment_intent', async (req, res) =>
	{
		const { paymentIntentID } = JSON.parse(req.body);

		await stripe.paymentIntents.cancel(paymentIntentID);
	})
}