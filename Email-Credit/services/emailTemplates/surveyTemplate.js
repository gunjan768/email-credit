const keys = require('../../config/keys');

module.exports = survey => 
{
	// Link which will be sent to the users is same. Sendgrid works somewhat differently. What is does that it replaces the link with it's own
	// created one and it will create different link for different user and send it to the user. Whenever user clicks on the link then Sendgrid
	// will know that which user clicks the link. How ?? Sendgrid will save the email id of the user and when the user clicks on the link then
	// Sendgrid will redirect the user to the link which Sendgrid replaces with it's own one. Sendgrid will wait for atleast 30 seconds whenever
	// any user clicks the link so that within that time if any other user clicks the link i.e Sendgrid then picks all the user as a bulk and 
	// redirect them. 
	return `
		<html>
			<body>
				<div style="text-align: center;">
				<h3>I'd like your input!</h3>
				<p>Please answer the following question:</p>
				<p>${survey.body}</p>
				<div>
					<a href="${keys.redirectDomain}/api/surveys/${survey.id}/yes">Yes</a>
				</div>
				<div>
					<a href="${keys.redirectDomain}/api/surveys/${survey.id}/no">No</a>
				</div>
				</div>
			</body>
		</html>
	`;
}