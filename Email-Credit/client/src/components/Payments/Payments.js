import React, {useState} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {CardElement, Elements, useElements, useStripe} from '@stripe/react-stripe-js';
import * as actions from '../../actions';
import { connect } from 'react-redux';
import { stripePaymentMethodHandler } from './PaymentHelper';
import axios from "axios";
import './Style/Card.module.css';

const CARD_OPTIONS = 
{
	iconStyle: 'solid',
	style: 
	{
		base: 
		{
			iconColor: '#c4f0ff',
			color: '#fff',
			fontWeight: 500,
			fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
			fontSize: '16px',
			fontSmoothing: 'antialiased',
			':-webkit-autofill': 
			{
				color: '#fce883',
			},
			'::placeholder': 
			{
				color: '#87bbfd',
			},
		},
		invalid: 
		{
			iconColor: '#ffc7ee',
			color: '#ffc7ee',
		},
	},
};

const CardField = ({ onChange }) => (
	<div className="FormRow">
		<CardElement options = { CARD_OPTIONS } onChange = { onChange } />
	</div>
);

const Field = (
{
	label,
	id,
	type,
	placeholder,
	required,
	autoComplete,
	value,
	onChange,
}) => (
	<div className="FormRow">
		<label htmlFor = { id } className="FormRowLabel">{ label }</label>
		<input
			className="FormRowInput"
			id = { id }
			type = { type }
			placeholder = { placeholder }
			required = { required }
			autoComplete = { autoComplete }
			value = { value }
			onChange= { onChange }
		/>
	</div>
);

const SubmitButton = ({ processing, error, children, disabled }) => (
	<button
		className = {`SubmitButton ${error ? 'SubmitButton--error' : ''}`}
		type="submit"
		disabled = { processing || disabled }
		style = 
		{{
			display: 'block',
			fontSize: '16px',
			width: 'calc(100% - 30px)',
			height: '40px',
			margin: '40px 15px 0',
			backgroundColor: '#f6a4eb',
			boxShadow:' 0 6px 9px rgba(50, 50, 93, 0.06), 0 2px 5px rgba(0, 0, 0, 0.08)',
			borderRadius: '4px',
			color: "#fff",
			fontWeight: '600',
			cursor: 'pointer',
			transition: 'all 100ms ease-in-out',
		}}
	>
		{ processing ? 'Processing...' : children }
	</button>
);

const ErrorMessage = ({ children }) => (
	<div className="ErrorMessage" role="alert">
		<svg width="16" height="16" viewBox="0 0 17 17">
		<path
			fill="#FFF"
			d="M8.5,17 C3.80557963,17 0,13.1944204 0,8.5 C0,3.80557963 3.80557963,0 8.5,0 C13.1944204,0 17,3.80557963 17,8.5 C17,13.1944204 13.1944204,17 8.5,17 Z"
		/>
		<path
			fill="#6772e5"
			d="M8.5,7.29791847 L6.12604076,4.92395924 C5.79409512,4.59201359 5.25590488,4.59201359 4.92395924,4.92395924 C4.59201359,5.25590488 4.59201359,5.79409512 4.92395924,6.12604076 L7.29791847,8.5 L4.92395924,10.8739592 C4.59201359,11.2059049 4.59201359,11.7440951 4.92395924,12.0760408 C5.25590488,12.4079864 5.79409512,12.4079864 6.12604076,12.0760408 L8.5,9.70208153 L10.8739592,12.0760408 C11.2059049,12.4079864 11.7440951,12.4079864 12.0760408,12.0760408 C12.4079864,11.7440951 12.4079864,11.2059049 12.0760408,10.8739592 L9.70208153,8.5 L12.0760408,6.12604076 C12.4079864,5.79409512 12.4079864,5.25590488 12.0760408,4.92395924 C11.7440951,4.59201359 11.2059049,4.59201359 10.8739592,4.92395924 L8.5,7.29791847 L8.5,7.29791847 Z"
		/>
		</svg>
		{children}
	</div>
);

const ResetButton = ({ onClick }) => (
	<button type="button" className="ResetButton" onClick={onClick}>
		<svg width="32px" height="32px" viewBox="0 0 32 32">
		<path
			fill="#FFF"
			d="M15,7.05492878 C10.5000495,7.55237307 7,11.3674463 7,16 C7,20.9705627 11.0294373,25 16,25 C20.9705627,25 25,20.9705627 25,16 C25,15.3627484 24.4834055,14.8461538 23.8461538,14.8461538 C23.2089022,14.8461538 22.6923077,15.3627484 22.6923077,16 C22.6923077,19.6960595 19.6960595,22.6923077 16,22.6923077 C12.3039405,22.6923077 9.30769231,19.6960595 9.30769231,16 C9.30769231,12.3039405 12.3039405,9.30769231 16,9.30769231 L16,12.0841673 C16,12.1800431 16.0275652,12.2738974 16.0794108,12.354546 C16.2287368,12.5868311 16.5380938,12.6540826 16.7703788,12.5047565 L22.3457501,8.92058924 L22.3457501,8.92058924 C22.4060014,8.88185624 22.4572275,8.83063012 22.4959605,8.7703788 C22.6452866,8.53809377 22.5780351,8.22873685 22.3457501,8.07941076 L22.3457501,8.07941076 L16.7703788,4.49524351 C16.6897301,4.44339794 16.5958758,4.41583275 16.5,4.41583275 C16.2238576,4.41583275 16,4.63969037 16,4.91583275 L16,7 L15,7 L15,7.05492878 Z M16,32 C7.163444,32 0,24.836556 0,16 C0,7.163444 7.163444,0 16,0 C24.836556,0 32,7.163444 32,16 C32,24.836556 24.836556,32 16,32 Z"
		/>
		</svg>
	</button>
);

const CheckoutForm = props => 
{
	const stripe = useStripe();
	const elements = useElements();
	
	const [error, setError] = useState(null);
	const [cardComplete, setCardComplete] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState(null);

	const [billingDetails, setBillingDetails] = useState(
	{
		email: '',
		phone: '',
		name: '',
	});

	const handleSubmit = async event => 
	{
		event.preventDefault();

		if(!stripe || !elements) 
		{
			// Stripe.js has not loaded yet. Make sure to disable form submission until Stripe.js has loaded.
			return;
		}

		if(error) 
		{
			elements.getElement('card').focus();
			
			return;
		}

		if(cardComplete) 
		{
			setProcessing(true);
		}

		const paymentMethod = await stripe.createPaymentMethod(
		{
			type: 'card',
			card: elements.getElement(CardElement),
			billing_details: billingDetails,
		});
	
		const { status, paymentIntentID } = await stripePaymentMethodHandler(paymentMethod, stripe);
		
		// This if block is only required when confirmation_method is set to "automatic" and confirm is set to 'false'.
		if(status === 'requires_confirmation')
		{
			const { data: { clientSecret }} = await axios.post('/api/client_secret',
			{
				paymentIntentID: paymentIntentID
			})
		
			const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, 
			{
				payment_method: 
				{
					type: 'card',
					card: elements.getElement(CardElement),
					billing_details: billingDetails
				}
			});
			
			if(error) 
			{
				// Show error to your customer (e.g., insufficient funds).
				console.log(error.message);
				
				cancelPaymentIntent(paymentIntentID);
			} 
			else 
			{
				// The payment has been processed!
				if(paymentIntent.status === 'succeeded') 
				{
					// Show a success message to your customer. There's a risk of the customer closing the window before callback execution. 
					// Set up a webhook or plugin to listen for the. payment_intent.succeeded event that handles any business critical
					// post-payment actions.
					setPaymentMethod(paymentMethod);
					
					props.fetchUser();
				}
			}
		}
		else if(status === 'succeeded')
		{	
			setPaymentMethod(paymentMethod);

			props.fetchUser();
		}
		else
		{
			cancelPaymentIntent(paymentIntentID);
		}

		setProcessing(false);
	}

	const cancelPaymentIntent = async paymentIntentID =>
	{
		if(paymentIntentID === undefined || null)
		return;

		await axios.post('/api/cancel_payment_intent',
		{
			paymentIntentID: JSON.stringify(paymentIntentID) 
		})
	}

	const reset = () => 
	{
		setError(null);

		setProcessing(false);
		setPaymentMethod(null);

		setBillingDetails(
		{
			email: '',
			phone: '',
			name: '',
		});
	};

	return paymentMethod ? 
	(
		<div className="Result"  style = {{ marginTop: "100px" }}>
			<div className="ResultTitle" role="alert">
				Payment successful
			</div>
			<div className="ResultMessage">
				Thanks for trying Stripe Elements. No money was charged, but we
				generated a PaymentMethod: { paymentMethod.id }
			</div>
			<ResetButton onClick = { reset } />
		</div>
	) 
	:
	(
		<form className="Form" onSubmit = { handleSubmit } style = {{ marginTop: "50px" }}>
			
			<fieldset className="FormGroup">
				<Field
					label="Name"
					id="name"
					type="text"
					placeholder="Jane Doe"
					required
					autoComplete="name"
					value = { billingDetails.name }
					onChange = { event => {  setBillingDetails({...billingDetails, name: event.target.value});  }}
				/>
				<Field
					label="Email"
					id="email"
					type="email"
					placeholder="janedoe@gmail.com"
					required
					autoComplete="email"
					value = { billingDetails.email }
					onChange = { event => { setBillingDetails({...billingDetails, email: event.target.value}); }}
				/>
				<Field
					label="Phone"
					id="phone"
					type="tel"
					placeholder="(941) 555-0123"
					required
					autoComplete="tel"
					value = { billingDetails.phone }
					onChange = { event => { setBillingDetails({...billingDetails, phone: event.target.value}); }}
				/>
			</fieldset>

			<fieldset className="FormGroup" style = {{ marginTop: "10px", marginBottom: "10px" }}>
				<CardField
					onChange = { event => { setError(event.error); setCardComplete(event.complete); }}
				/>
			</fieldset>

			{ error && <ErrorMessage>{ error.message }</ErrorMessage> }

			<SubmitButton processing = { processing } error = { error } disabled = { !stripe }>Pay Rs 120</SubmitButton>

		</form>
	);
}

const ELEMENTS_OPTIONS = 
{
	fonts: [
		{
			cssSrc: 'https://fonts.googleapis.com/css?family=Roboto',
		},
	],
};

// Make sure to call `loadStripe` outside of a component’s render to avoid recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

const Payment = props => 
{
	return (
		<div className="AppWrapper">
			<Elements 
				stripe = { stripePromise } 
				options = { ELEMENTS_OPTIONS }
			>
				<CheckoutForm { ...props } />
			</Elements>
		</div>
	);
};

export default connect(null, actions)(Payment);