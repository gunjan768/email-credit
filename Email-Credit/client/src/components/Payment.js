import React, { Component } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { connect } from 'react-redux';
import * as actions from '../actions';
// import { Stripe } from 'stripe';

class Payments extends Component 
{
	render() 
	{
		return (
			<StripeCheckout
				name="Emaily"
				description="$5 for 5 email credits"
				panelLabel="Give Money"
				zipCode = { true }
				alipay
				bitcoin
				currency="USD"
				// shippingAddress
				billingAddress = { true }
				amount = { 500 }
				token = { token => this.props.handleToken(token) }
				stripeKey = { process.env.REACT_APP_STRIPE_KEY }
			>
				<button className="btn">Add Credits</button>
			</StripeCheckout>
		);
	}
}

export default connect(null, actions)(Payments);