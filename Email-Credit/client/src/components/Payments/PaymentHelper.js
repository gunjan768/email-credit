import axios from "axios";

export const stripePaymentMethodHandler = async ({ paymentMethod: { error, id }}, stripe) => 
{
    if(error) 
    {
        return {
            result: "Payment is unsuccessfull as there is an error in the creation of payment method",
            paymentIntentID: null
        };
    } 
    else 
    {
        // Send paymentMethod.id to your backend server i.e to the nodeJs (as I used nodeJs as a backend).
        try
        {
            const { data } = await axios.post('/api/stripe',
            { 
                paymentMethodID: JSON.stringify(id) 
            });
           
            return handleServerResponse(data, stripe);
        }
        catch(error)
        {
            throw Error("Error while sending id to server");
        }
    }
}

const handleServerResponse = async (response, stripe = null) => 
{
    if(response.error) 
    {
        // Show error from server on payment form.
        return { 
            status: "Payment is unsuccessfull and failed either due to invalid payment method id or payment intent id",
            paymentIntentID: response.paymentIntentID
        };
    } 
    else if(response.requires_action) 
    {
        // Use Stripe.js to handle required card action. Use stripe.handleCardAction to trigger the UI for handling customer action. If 
        // authentication succeeds, the PaymentIntent has a status of 'requires_confirmation'. You then need to confirm the PaymentIntent again 
        // on your server to finish the payment. Use stripe.handleCardAction in the Payment Intents API 'manual' confirmation flow to handle a 
        // PaymentIntent with the requires_action status. It will throw an error if the PaymentIntent has a different status. This method returns 
        // a Promise which resolves with a result object. This object has either:
        //          1) result.paymentIntent: a PaymentIntent with the requires_confirmation status to confirm server-side.
        //          2) result.error: an error. Refer to the API reference for all possible errors.

        const { error: errorAction, paymentIntent } = await stripe.handleCardAction(response.payment_intent_client_secret);
        
        if(errorAction) 
        {
            // Show error from Stripe.js in payment form.
            return {
                result : "Error while handling card actions"
            };
        } 
        else
        {
            // The card action has been handled and the PaymentIntent can be confirmed again on the server. Use axios or fetch as your wish.
            const serverResponse = await fetch('/api/stripe', 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentIntentID: paymentIntent.id })
            });
            
            const getData = await serverResponse.json();

            return { 
                ...await handleServerResponse(getData), 
            };
        }
    }
    else if(response.requires_confirnmation)
    {
        return {
            status: "requires_confirnmation",
            paymentIntentID: response.paymentIntentID
        };
    }
    else 
    { 
        // This else block will be executed when response has success property true i.e when confirmation is also get completed.
        return { 
            status: "succeeded",
            paymentIntentID: response.paymentIntentID
        };
    }
}