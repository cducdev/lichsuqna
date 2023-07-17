const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
const {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
} = require("firebase/auth");
const auth = require("../firebase/getAuth");
const { getAuth } = require("firebase-admin/auth");
const { actionCodeSettings } = require("../config/config");
const OAuth2Client = require("../config/O2AuthClientConfig");
module.exports = {
	sendResetPwdMail: async (userEmail, payload) => {
		try {
			const myAccessToken =
				await OAuth2Client.myOAuth2Client.getAccessToken();
			const transpoter = nodemailer.createTransport({
				host: "localhost",
				service: "gmail",
				port: 465,
				secure: true,
				auth: {
					type: "OAUTH2",
					user: process.env.SERVER_EMAIL_ADDRESS,
					clientId: OAuth2Client.GOOGLE_MAILER_CLIENT_ID,
					clientSecret: OAuth2Client.GOOGLE_MAILER_CLIENT_SECRET,
					refreshToken: OAuth2Client.GOOGLE_MAILER_REFRESH_TOKEN,
					accessToken: myAccessToken,
				},
			});
			const mailTemplateStr = fs
				.readFileSync(
					path.join(__dirname + "/../../views/emailTempl.hbs")
				)
				.toString("utf-8");
			const mailTemplate = handlebars.compile(mailTemplateStr);
			const message = {
				from: process.env.SERVER_EMAIL_ADDRESS,
				to: userEmail,
				subject: "Đổi mật khẩu tài khoản web Lịch Sử Quảng Nam",
				html: mailTemplate(payload),
			};
			transpoter.sendMail(message, (err, info) => {
				if (err) {
					console.log(err);
					return err;
				} else {
					return { status: 200, success: true };
				}
			});
		} catch (e) {
			console.log(e);
		}
	},
	isAuth: async (sessionToken) => {
		try {
			const checkAuth = await admin
				.auth()
				.verifySessionCookie(sessionToken);
			return checkAuth;
		} catch (error) {
			console.log(error);
		}
	},
	logIn: async (logInData) => {
		try {
			const logInResult = await signInWithEmailAndPassword(
				auth,
				logInData.email,
				logInData.pwd
			);
			return logInResult;
		} catch (err) {
			console.log(err);
		}
	},
	signUp: async (signUpData) => {
		try {
			const email = signUpData.email;
			const pwd = signUpData.pwd;
			const signUpResult = await createUserWithEmailAndPassword(
				auth,
				email,
				pwd
			);
			await admin.auth().setCustomUserClaims(signUpResult.user.uid, {
				role: "Thành viên",
			});
			return signUpResult;
		} catch (err) {
			console.log(err);
		}
	},
	createSessionCookies: async (idToken, expiresIn) => {
		const sessionCookie = await admin
			.auth()
			.createSessionCookie(idToken, { expiresIn });
		return sessionCookie;
	},
	resetPasswordWithEmailLink: async (userEmail) => {
		try {
			const link = await getAuth().generatePasswordResetLink(
				userEmail,
				actionCodeSettings
			);
			const userInfo = await getAuth().getUserByEmail(userEmail);
			return module.exports.sendResetPwdMail(userEmail, {
				username: userInfo.displayName,
				link: link,
			});
		} catch (e) {
			console.log(e);
		}
	},
};
