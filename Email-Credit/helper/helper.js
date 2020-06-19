const generateResponse = ({ status, id, client_secret, next_action} ) => 
{ 
    // Note that if your API version is before 2019-02-11, 'requires_action' appears as 'requires_source_action'. This if condition will be
    // executed when generateResponse() is called just after the creation of paymentIntents. After this it will go for paymentIntens 
    // confirmation.
    if(status === 'requires_action' && next_action.type === 'use_stripe_sdk')
    {
        // Tell the client to handle the action. 
        return {
            requires_action: true,
            payment_intent_client_secret: client_secret
        };
    }
    else if(status === 'requires_confirmation')
    {
        return {
            requires_confirnmation: true,
            paymentIntentID: id
        };
    }
    else if(status === 'succeeded') 
    {
        // The payment didn’t need any additional actions and completed. Handle post-payment fulfillment. This elseif block will be executed 
        // just after the confirmation off paymentIntents i.e payment is confirmed and successfull.
        return {
            success: true,
            paymentIntentID: id
        };
    } 
    else
    {
        // Invalid status.
        return {
            error: 'Invalid PaymentIntent status',
            paymentIntentID: id
        };
    }
};

module.exports = 
{
    generateResponse
}