const express = require("express");
const route = express.Router();
const middleWare = require("../middleware/auth");
const adminModelFn = require("../model/admin.model");
const firestore = require("../firebase/firestore");

route.get("/", middleWare.isAdmin, async (req, res) => {
	const currentTag = await adminModelFn.getAllCurrentTag();
	const webData = await firestore.collection("web-data").doc("detail").get();
	let tagArr = [];
	currentTag.forEach((tag) => {
		tagArr.push({ value: Object.values(tag)[0], key: Object.keys(tag)[0] });
	});
	res.render("customizepage", {
		Auth: true,
		currentTag: tagArr,
		webData: webData.data(),
	});
});

route.post("/updateHeader", middleWare.isAdmin, async (req, res) => {
	try {
		for (key in req.body) {
			if (!req.body[key]) {
				delete req.body[key];
			}
		}
		if (Object.keys(req.body).length == 0) {
			return res.json(200);
		} else
			await firestore
				.collection("web-data")
				.doc("detail")
				.update(req.body);
		res.json(200);
	} catch (e) {
		res.status(502);
	}
});

route.post("/updateVideo", middleWare.isAdmin, async (req, res) => {
	try {
		for (key in req.body) {
			if (!req.body[key]) {
				delete req.body[key];
			}
		}
		if (Object.keys(req.body).length == 0) {
			return res.json(200);
		} else
			await firestore
				.collection("web-data")
				.doc("detail")
				.update(req.body);
		res.json(200);
	} catch (e) {
		res.status(502);
	}
});
route.post("/updateTag", middleWare.isAdmin, async (req, res) => {
	try {
		await firestore
			.collection("web-data")
			.doc("detail")
			.update({ currentTag: req.body.currentTag });
		res.json(200);
	} catch (e) {
		res.status(502);
	}
});
route.post("/updateQuizImage", middleWare.isAdmin, async (req, res) => {
	try {
		await firestore.collection("web-data").doc("detail").update(req.body);
		res.json(200);
	} catch (e) {
		res.status(502);
	}
});

module.exports = route;
