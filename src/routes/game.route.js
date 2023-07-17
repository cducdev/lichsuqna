const express = require("express");
const route = express.Router();
const gameModelFn = require("../model/game.model");
const authModelFn = require("../model/auth.model");
const db = require("../firebase/firebase_realtimedb");
const isRoomActive = require("../middleware/room");
const { getAuth } = require("firebase-admin/auth");
const room = require("../middleware/room");
route.get("/", async (req, res) => {
	const session = req.cookies.session || " ";
	const isAuth = (await authModelFn.isAuth(session)) || "";
	const dbQuesLength = await db.ref("Questions/").get();
	const ques = gameModelFn.generateRandomQuestion(dbQuesLength.val().length);
	res.cookie("ques", ques, {
		maxAge: 600000,
	});
	res.render("game", {
		Auth: !!isAuth,
		notAuth: !isAuth,
		uid: isAuth.uid || "",
		pushKey: db.ref("Scoreboards/").push().key,
	});
});
route.get("/scoreboards/", async (req, res) => {
	try {
		const session = req.cookies.session || "";
		const isAuth = await authModelFn.isAuth(session);
		let result = await gameModelFn.getScoreboards();
		let nameArr = [];
		let data = [];
		for (i = 0; i < result.length; i++) {
			if (!nameArr[result[i].username]) {
				try {
					let userInfo = await getAuth().getUser(result[i].username);
					nameArr[result[i].username] = userInfo.displayName;
				} catch (e) {
					nameArr[result[i].username] = result[i].username;
				}
			}
		}
		for (i = 0; i < result.length; i++) {
			result[i].username = nameArr[result[i].username];
			data.push(result[i]);
		}
		result.length = result.length - (result.length - 10);
		res.render("game", {
			Auth: isAuth != undefined,
			scoreboards: true,
			data: JSON.stringify(data),
			result: result,
		});
	} catch (e) {
		// throw "ERROR";
	}
});
route.post("/getQuestion/", async (req, res) => {
	const data = req.body;
	const arrQues = req.cookies.ques;
	let ques;
	if (data.qIdx == 0) {
		ques = await gameModelFn.getFirstQuestion(data, arrQues);
		res.json(ques);
	} else {
		await gameModelFn.checkAnsAndGetQuestion(data, arrQues, res);
	}
});
route.get("/:roomId/", isRoomActive, async (req, res) => {
	const session = req.cookies.session || "";
	const roomID = req.params.roomId;
	let isAuth, userName, uid, roomInfo;
	try {
		isAuth = await authModelFn.isAuth(session);
		userName = isAuth.name;
		uid = isAuth.uid;
	} catch (e) {
		userName = req.cookies.name || "";
		uid = "";
	}
	try {
		roomInfo = await gameModelFn.getRoomInfo(uid, userName, roomID);
		if (roomInfo.endGame === 2)
			quizUserInfo = await gameModelFn.getQuizUserInfo(roomInfo);
	} catch (e) {
		res.redirect("/game/");
	}
	hostName = roomInfo.host.userInfo;
	let result = [];
	if (roomInfo.endGame === 2)
		result = [quizUserInfo.host, quizUserInfo.client];
	result.sort((b, a) => a.scores - b.scores || b.time - a.time);
	res.render("room", {
		Auth: isAuth != undefined,
		endGame: roomInfo.endGame === 2,
		roomResult: result,
		notAuth: !isAuth || room.isHost,
		AuthorHost: isAuth != undefined || roomInfo.isHost,
		uid: uid,
		userName: userName,
		roomId: roomID,
		roomInfo: roomInfo,
		hostName: hostName,
	});
});

module.exports = route;
