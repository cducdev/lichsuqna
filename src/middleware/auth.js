const express = require("express");
const authModelFn = require("../model/auth.model");
const userModelFn = require("../model/user.model");
const cookieParser = require("cookie-parser");
const firestore = require("../firebase/firestore");
const app = express();
app.use(cookieParser());

module.exports = {
	isAuth: async (req, res, next) => {
		try {
			const token = req.cookies.session || " ";
			if (!token) return res.status(403).send("Access denied.");
			else {
				const decodedToken = await authModelFn.isAuth(token);
				if (!decodedToken) res.status(400).redirect("/user/");
				else next();
			}
		} catch (error) {
			console.log(error);
			res.status(400).redirect("/user/");
		}
	},
	isAdmin: async (req, res, next) => {
		try {
			const token = req.cookies.session || " ";
			if (!token) return res.status(403).send("Access denied.");
			else {
				const userInfo = await userModelFn.getUserInfo(token);
				if (userInfo.role != "Quản trị viên")
					return res.status(400).redirect("/user/");
				next();
			}
		} catch (e) {
			console.log(error);
			res.status(401).redirect("/user/");
		}
	},
	isNotMember: async (req, res, next) => {
		try {
			const token = req.cookies.session || " ";
			const blogData = (
				await firestore
					.collection("pending")
					.doc(decodeURI(req.params.blogId))
					.get()
			).data();
			if (!token) return res.status(403).send("Access denied.");
			else {
				const userInfo = await userModelFn.getUserInfo(token);
				if (
					userInfo.role == "Thành viên" &&
					blogData.authorUID != userInfo.uid
				)
					return res.status(400).redirect("/user/");
				next();
			}
		} catch (e) {
			console.log(e);
			res.status(401).redirect("/user/");
		}
	},
	isUserPage: async (req, res, next) => {
		try {
			const token = req.cookies.session || " ";
			if (!token) return res.status(403).send("Access denied.");
			else {
				const decodedToken = await authModelFn.isAuth(token);
				if (!decodedToken) res.status(400).redirect("/user/");
				else if (decodedToken.uid != req.params.userId)
					res.status(400).redirect("/user/");
				else next();
			}
		} catch (error) {
			// console.log(error);
			res.status(400).redirect("/user/");
		}
	},
};
