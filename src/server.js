require("dotenv").config();
const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const firestore = require("./firebase/firestore");
const {
	getDatabase,
	ref,
	child,
	get,
	set,
	update,
} = require("firebase/database");
const db = require("./firebase/firebase_realtimedb");
const cookieParser = require("cookie-parser");
const middleWare = require("./middleware/auth");
const userRoute = require("./routes/users/user.route");
const editorRoute = require("./routes/users/editor.route");
const blogRoute = require("./routes/blog.route");
const gameRoute = require("./routes/game.route");
const customizeRoute = require("./routes/customize.route");
const initialPath = path.join(__dirname, "../public");
const authModelFn = require("./model/auth.model");
const userModelFn = require("./model/user.model");
const {
	generateRandomQuestion,
	getQuizUserInfo,
	getRoomInfo,
} = require("./model/game.model");
const { getAuth } = require("firebase-admin/auth");
const { ServerValue } = require("firebase-admin/database");

const app = express();
const PORT = process.env.PORT || 3000;
const server = require("http").createServer(app);
const io = require("socket.io")(server);
server.listen(PORT);

app.engine(
	"hbs",
	engine({
		defaultLayout: "main",
		helpers: {
			inc: function (value, options) {
				return parseInt(value) + 1;
			},
		},
		extname: ".hbs",
	})
);
app.set("view engine", "hbs");
app.set("views", "./views");
app.use(express.static(initialPath));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/user", userRoute);
app.use("/editor", editorRoute);
app.use("/blog/", blogRoute);
app.use("/blog/", express.static(path.join(__dirname, "../public")));
app.use("/game/", gameRoute);
app.use("/customize-web/", customizeRoute);

const dbRef = ref(getDatabase());

app.get("/", async (req, res) => {
	const token = req.cookies.session || " ";
	try {
		const isAuth = await authModelFn.isAuth(token);
		const blogData = await userModelFn.getBlog("", true);
		const webData = await firestore
			.collection("web-data")
			.doc("detail")
			.get();
		blogData.forEach((blog) => {
			let blogTag = [];
			blog.categoryTag.forEach((tag) => {
				blogTag.push(Object.keys(tag));
			});
			blog.categoryTag = blogTag;
		});
		blogData.length = blogData.length - (blogData.length - 4);
		res.render("home", {
			Auth: isAuth != undefined,
			blogData: blogData,
			webData: webData.data(),
		});
	} catch (e) {
		console.log(e);
		res.sendStatus(500);
	}
});

app.get("/info", (req, res) => {
	res.render("info");
});

app.get("/upload-quiz", middleWare.isNotMember, (req, res) => {
	res.render("uploadquiz", {
		Auth: true,
	});
});

app.post("/upload", middleWare.isAuth, async (req, res) => {
	const reqId = req.headers.referer.split("/");
	let id = reqId[4];
	if (id != "" && id != undefined) {
		id = decodeURI(reqId[4]);
	} else {
		id = req.body.id;
	}
	if (id == "pending") {
		id = decodeURI(reqId[5]);
	}
	if (id == req.body.id) id = id.split(" ").join("-");
	const data = {
		title: req.body.title,
		overview: req.body.overview,
		article: req.body.article,
		id: id,
		bannerSrc: req.body.bannerImgSrc,
		categoryTag: req.body.tag,
		likeCount: 0,
		dislikeCount: 0,
		views: 0,
	};
	let token = req.cookies.session || " ";
	try {
		const userCredential = await userModelFn.getUserInfo(token);
		const role = userCredential.role;
		data.author = userCredential.name;
		data.authorUID = userCredential.uid;
		data.writeTime = admin.firestore.FieldValue.serverTimestamp();
		if (role != "Thành viên") {
			await firestore.collection("post-data").doc(data.id).set(data, {
				merge: true,
			});
		} else {
			await firestore.collection("pending").doc(data.id).set(data, {
				merge: true,
			});
		}
	} catch (e) {
		res.status(401);
	}
	res.status(200).json({ redirect: "/" });
});

app.post("/uploadQuiz", middleWare.isNotMember, (req, res) => {
	const data = req.body;
	get(child(dbRef, "Questions"))
		.then((snapshot) => snapshot.val())
		.then((quesData) => {
			set(ref(getDatabase(), `Questions/${quesData.length}`), {
				ans: data.ans,
				ques: data.ques,
			});
		});
	res.json(200);
});

app.use((req, res) => {
	res.json("404");
});
const createRoomID = () => {
	let chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let randomStr = "";
	for (let i = 0; i < 5; i++)
		randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
	return randomStr;
};
io.of(/^\/game\/\w+$/).on("connection", async (socket) => {
	console.log("User connected");
	socket.on("create", async (room, host) => {
		try {
			let activeRoom = await get(child(dbRef, `room/${room}`));
			while (activeRoom.exists()) {
				room = createRoomID();
				activeRoom = await get(child(dbRef, `room/${room}`));
			}
			try {
				let hostInfo = await getAuth().getUser(host);
				let hostName = hostInfo.displayName;
				await set(child(dbRef, `rooms/${room}`), {
					host: {
						userInfo: hostName,
						hostUID: hostInfo.uid,
						scores: 0,
					},
					client: { userInfo: "", clientUID: "", scores: 0 },
					endGame: 0,
				});
			} catch (e) {
				await set(child(dbRef, `rooms/${room}`), {
					host: {
						userInfo: host,
						hostUID: host,
						scores: 0,
					},
					client: { userInfo: "", clientUID: "", scores: 0 },
				});
			}
		} catch (e) {
			console.log(e);
		}
		socket.emit("createRoomSuccess", room);
		currentRoomId = room;
	});
	socket.on("leave-room", async (room, clientInfo) => {
		socket.leave(room);
		const ref = db.ref(`rooms/${room}/client/`);
		const snapshot = await get(child(dbRef, `rooms/${room}`));
		if (snapshot.val().endGame != 2) {
			await ref.update({
				userInfo: "",
				clientUID: "",
			});
		}
	});
	socket.on("join-room", async (room, clientInfo) => {
		mapObject = socket.adapter.rooms;
		clientsInRoom = new Set(mapObject);
		let hostInfo;
		if (clientsInRoom.size <= 3) {
			socket.join(room);
			try {
				hostInfo = (
					await get(child(dbRef, `rooms/${room}/host/`))
				).val();
				if (
					clientInfo != hostInfo.hostUID &&
					clientInfo != hostInfo.userInfo
				) {
					try {
						let userAuth = await getAuth().getUser(clientInfo);
						let clientName = userAuth.displayName;
						await update(child(dbRef, `rooms/${room}/client/`), {
							userInfo: clientName,
							clientUID: clientInfo,
						});
						clientInfo = clientName;
					} catch (e) {
						await update(child(dbRef, `rooms/${room}/client/`), {
							userInfo: clientInfo,
							clientUID: clientInfo,
						});
					}
				} else {
					clientInfo =
						(await get(child(dbRef, `rooms/${room}/client/`))).val()
							.userInfo || "";
				}
			} catch (e) {
				console.log(e);
			}
			console.log(clientsInRoom.size);
			socket.emit("newUserJoined", clientsInRoom.size, clientInfo);
			socket
				.to(room)
				.emit("newUserJoined", clientsInRoom.size, clientInfo);
		} else {
			console.log("FULL");
			socket.emit("roomFulled", "msg");
		}
	});
	socket.on("start-game", async (room) => {
		const ref = db.ref("Questions/");
		try {
			let dbQuesLength = (await ref.get()).val().length;
			let questionIndex = generateRandomQuestion(dbQuesLength);
			socket.emit("generate-ques", questionIndex);
			socket.to(room).emit("generate-ques", questionIndex);
		} catch (e) {
			console.log(e);
		}
	});
	socket.on("get-question", async (arrQues, qIdx, roomId) => {
		const ref = db.ref(`Questions/${arrQues[qIdx]}`);
		const snapshot = await ref.get();
		await update(child(dbRef, `rooms/${roomId}`), {
			startTime: ServerValue.TIMESTAMP,
		});
		let data = {
			ques: snapshot.val().ques,
			ans: snapshot.val().ans.value,
		};
		socket.emit("return-question", data);
	});
	socket.on("check-ans", async (quesArr, qIdx, ansIdx, room, userInfo) => {
		const ref = db.ref(`Questions/${quesArr[qIdx]}/ans/is_correct/`);
		const snapshot = await ref.get();
		const ans = snapshot.val();
		const userAns = ans[ansIdx].correct;
		let userData;
		for (let i = 0; i < 4; i++) if (ans[i].correct) correctAns = i;
		if (qIdx + 1 <= 9) {
			nextQuesRef = db.ref(`Questions/${quesArr[qIdx + 1]}`);
			nextQues = await nextQuesRef.get();
			data = {
				ques: nextQues.val().ques,
				ans: nextQues.val().ans.value,
			};
		} else {
			data = {};
		}
		let allPlayerScores = (await db.ref(`rooms/${room}`).get()).val();
		if (
			userInfo == allPlayerScores.host.hostUID ||
			userInfo == allPlayerScores.host.userInfo
		) {
			userData = allPlayerScores.host;
			isHost = true;
		}
		if (
			userInfo == allPlayerScores.client.clientUID ||
			userInfo == allPlayerScores.client.userInfo
		) {
			userData = allPlayerScores.client;
			isHost = false;
		}
		if (userAns) {
			userData.scores += 10;
		}
		if (userData == allPlayerScores.host) {
			await db.ref(`rooms/${room}/host/`).set(userData);
		} else {
			await db.ref(`rooms/${room}/client/`).set(userData);
		}
		socket.emit(
			"check-success",
			userAns,
			correctAns,
			ansIdx,
			qIdx + 1,
			data
		);
		userData.qIdx = qIdx + 2;
		let arr = [allPlayerScores.client, allPlayerScores.host];
		arr.sort((a, b) => b.scores - a.scores);
		socket.to(room).emit("update-scoreboards", arr, 0);
		socket.emit("update-scoreboards", arr, qIdx + 2);
	});
	socket.on("end-game", async (room, userInfo) => {
		const ref = db.ref(`rooms/${room}/`);
		try {
			let snapshot = await ref.get();
			let data = snapshot.val();
			data.endGame = data.endGame + 1;
			if (userInfo == data.host.hostUID || userInfo == data.host.userInfo)
				data.host.endTime = ServerValue.TIMESTAMP;
			if (
				userInfo == data.client.clientUID ||
				userInfo == data.client.userInfo
			)
				data.client.endTime = ServerValue.TIMESTAMP;
			await ref.set(data);
			let endGame = data.endGame;
			let quizUserInfo = {};
			if (endGame === 2) {
				let roomInfo = await getRoomInfo(userInfo, userInfo, room);
				quizUserInfo = await getQuizUserInfo(roomInfo);
				result = [quizUserInfo.client, quizUserInfo.host];
				result.sort((a, b) => b.scores - a.scores || a.time - b.time);
				socket.emit("end-game", data, userInfo, result);
				socket.to(room).emit("end-game", data, userInfo, result);
				console.log(data);
			} else {
				socket.emit("end-game", data);
				socket.to(room).emit("end-game", data, userInfo);
			}
		} catch (e) {
			console.log(e);
		}
	});
});
