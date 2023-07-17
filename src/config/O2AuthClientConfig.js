const { OAuth2Client } = require("google-auth-library");

module.exports.GOOGLE_MAILER_CLIENT_ID = process.env.GOOGLE_MAILER_CLIENT_ID;
module.exports.GOOGLE_MAILER_CLIENT_SECRET =
	process.env.GOOGLE_MAILER_CLIENT_SECRET;
module.exports.GOOGLE_MAILER_REFRESH_TOKEN =
	process.env.GOOGLE_MAILER_REFRESH_TOKEN;

const myOAuth2Client = new OAuth2Client(
	process.env.GOOGLE_MAILER_CLIENT_ID,
	process.env.GOOGLE_MAILER_CLIENT_SECRET
);
myOAuth2Client.setCredentials({
	refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
});
module.exports.myOAuth2Client = myOAuth2Client;
