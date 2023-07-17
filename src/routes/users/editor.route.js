const express = require("express");
const route = express.Router();
const checkAuth = require("../../middleware/auth");
const checkBlogExist = require("../../middleware/blog");
const firestore = require("../../firebase/firestore");
const authModelFn = require("../../model/auth.model");
const pendingBlog = require("../../middleware/pendingblog");
const userModel = require("../../model/user.model");
// const dictPath = "/config/vn_words/Viet74k.txt";
// const autoCorrectModel = require("../../model/autoCorrect.model");
// const autoCorrect = require("autocorrect")({ dictionary: dictPath });
route.get("/", checkAuth.isAuth, async (req, res) => {
	const tagData = (
		await firestore.collection("web-data").doc("detail").get()
	).data().currentTag;
	let tagArr = [];
	tagData.forEach((tag) => {
		for (key in tag) {
			tagArr.push({ key: key, value: tag[key] });
		}
	});
	res.render("editor", { bannerSrc: "none", Auth: true, tagArr: tagArr });
});
// route.post("/auto-correct", async (req, res) => {
// 	const word = req.query.sentences;
// 	const dictionary = autoCorrectModel.readDictionary("");
// 	const correct = await autoCorrectModel.correctWord(word, dictionary);
// 	console.log(correct);
// 	res.json({ correct: autoCorrect(word) });
// });
route.get(
	"/pending/:blogId",
	pendingBlog,
	checkAuth.isNotMember,
	async (req, res) => {
		const idToken = req.cookies.session || "";
		const blogId = decodeURI(req.params.blogId);
		const blogData = (
			await firestore.collection("pending").doc(blogId).get()
		).data();
		const tagData = (
			await firestore.collection("web-data").doc("detail").get()
		).data().currentTag;
		let tagArr = [];
		tagData.forEach((tag) => {
			for (key in tag) {
				tagArr.push({ key: key, value: tag[key] });
			}
		});
		let tagOfBlog = [];
		for (let i = 0; i < blogData.categoryTag.length; i++) {
			tagOfBlog.push(Object.values(blogData.categoryTag[i])[0]);
		}
		tagArr.forEach((tag) => {
			for (i = 0; i < tagOfBlog.length; i++) {
				if (tag.value == tagOfBlog[i]) {
					tag.check = "checked";
				}
			}
		});
		const userInfo = await authModelFn.isAuth(idToken);
		if (userInfo.uid == blogData.authorUID) {
			res.render("editor", {
				bannerSrc: blogData.bannerSrc,
				header: blogData.title,
				overview: blogData.overview,
				content: blogData.article,
				Auth: userInfo != undefined,
				edit: true,
				tagArr: tagArr,
			});
		} else {
			res.redirect("/");
		}
	}
);
route.get("/:blogId", checkBlogExist, async (req, res) => {
	const idToken = req.cookies.session || "";
	const blogId = decodeURI(req.params.blogId);
	const blogData = (
		await firestore.collection("post-data").doc(blogId).get()
	).data();
	const tagData = (
		await firestore.collection("web-data").doc("detail").get()
	).data().currentTag;
	let tagArr = [];
	tagData.forEach((tag) => {
		for (key in tag) {
			tagArr.push({ key: key, value: tag[key] });
		}
	});
	let tagOfBlog = [];
	for (let i = 0; i < blogData.categoryTag.length; i++) {
		tagOfBlog.push(Object.values(blogData.categoryTag[i])[0]);
	}
	tagArr.forEach((tag) => {
		for (i = 0; i < tagOfBlog.length; i++) {
			if (tag.value == tagOfBlog[i]) {
				tag.check = "checked";
			}
		}
	});
	const userInfo = await userModel.getUserInfo(idToken);
	if (userInfo.uid == blogData.authorUID || userInfo.role != "Thành viên") {
		res.render("editor", {
			bannerSrc: blogData.bannerSrc,
			header: blogData.title,
			overview: blogData.overview,
			content: blogData.article,
			Auth: true,
			edit: true,
			tagArr: tagArr,
		});
	} else {
		res.redirect("/");
	}
});

module.exports = route;
