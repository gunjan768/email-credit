const sgMail = require('@sendgrid/mail');
require('dotenv').config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const prepareMails = ({ subject, recipients }, HTMLContent) =>
{
    return {
        to: recipients,
        from: 'gunjan768@gmail.com',
        subject: subject,
        html: HTMLContent
    };
}

const sendMail = async messageBody =>
{
    try
    {
        await sgMail.sendMultiple(messageBody);

        console.log('Email(s) sent successfully!');
    }
    catch(error)
    {
        throw new Error('Failed sending email(s)');   
    }
}

module.exports = 
{
    prepareMails,
    sendMail
};