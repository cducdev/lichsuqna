const firestore = require("../firebase/firestore");
const modelFn = require("../model/auth.model");
const adminModelFn = require("../model/admin.model");
const { getAuth } = require("firebase-admin/auth");
const { signOut } = require("firebase/auth");
const userModel = require("../model/user.model");
module.exports = {
	index: (req, res) => {
		const session = req.cookies.session || " ";
		modelFn
			.isAuth(session)
			.then((decodedToken) => {
				res.redirect(`/user/${decodedToken.uid}/`);
			})
			.catch((error) => {
				res.render("dashboard", {
					Auth: false,
				});
			});
	},
	logIn: async (req, res) => {
		const logInData = req.body;
		const expiresIn = 60 * 60 * 24 * 5 * 1000;
		try {
			const userCredential = await modelFn.logIn(logInData);
			if (userCredential == undefined) {
				res.json({ code: "Email hoặc mật khẩu không chính xác" });
			} else {
				const idToken = await userCredential.user.getIdToken();
				const sessionCookie = await modelFn.createSessionCookies(
					idToken,
					expiresIn
				);
				const options = {
					maxAge: expiresIn,
					httpOnly: true,
					secure: false,
				};
				res.cookie("session", sessionCookie, options);
				res.json({ redirect: "/user" });
			}
		} catch (err) {
			console.log(err);
			res.json(401);
		}
	},
	register: async (req, res) => {
		const session = req.cookies.session || "";
		try {
			const isAuth = await modelFn.isAuth(session);
			if (!isAuth) {
				res.render("dashboard", {
					isRegister: true,
				});
			} else {
				res.redirect(`/user/${isAuth.uid}/`);
			}
		} catch (e) {
			res.json(e);
		}
	},
	signUp: async (req, res) => {
		const signUpData = req.body;
		try {
			const userCredential = await modelFn.signUp(signUpData);
			const uid = userCredential.user.uid;
			getAuth().updateUser(uid, {
				displayName: signUpData.accountName,
				photoURL:
					"https://i.pinimg.com/564x/31/7c/87/317c87f5eec32d4ac39c328069bc9d19.jpg",
			});
			let category = (
				await firestore.collection("web-data").doc("detail").get()
			).data().currentTag;
			let result = [];
			category.forEach((cate) => {
				for (key in cate) {
					result.push({
						lable: key,
						views: 0,
					});
				}
			});
			await firestore.collection("user").doc(uid).set({
				likedPost: [],
				dislikedPost: [],
				category: result,
			});
			res.json({ redirect: "/user" });
		} catch (err) {
			console.log(err);
			res.json({
				code: "Email đã được sử dụng",
			});
		}
	},
	showProfile: async (req, res) => {
		let token = req.cookies.session || "";
		try {
			const userInfo = await userModel.getUserInfo(token);
			const pendingBlog = await userModel.getPendingBlog(userInfo);
			res.render("dashboard", {
				Auth: true,
				Home: true,
				user: userInfo,
				isNotMember: userInfo.role != "Thành viên",
				PageTitle: "Thông tin",
				pendingLength: pendingBlog.length,
			});
		} catch (err) {
			console.log(err);
			res.redirect("/user");
		}
	},
	logOut: (req, res) => {
		res.clearCookie("session", { path: "/" });
		res.clearCookie("token", { path: "/" });
		res.redirect("/user");
	},
	forgotPass: (req, res) => {
		res.render("dashboard", {
			Auth: false,
			forgotpassword: true,
		});
	},
	sendEmail: async (req, res) => {
		const email = req.body.email;
		await modelFn.resetPasswordWithEmailLink(email);
		res.json("Success");
	},
};
