const { ServerValue } = require("firebase-admin/database");
const { getAuth } = require("firebase-admin/auth");
const db = require("../firebase/firebase_realtimedb");
module.exports = {
	getFirstQuestion: async (data, arrQues) => {
		const userRef = db.ref(`Scoreboards/${data.pushKey}/${data.uid}`);
		const ref = db.ref(`Questions/${arrQues[data.qIdx]}`);
		userRef.set({
			startTime: ServerValue.TIMESTAMP,
		});
		const snapshot = await ref.get();
		let datas = {
			ques: snapshot.val().ques,
			ans: snapshot.val().ans.value,
			qIdx: 1,
		};
		return datas;
	},
	generateRandomQuestion: (dbQuesLength) => {
		const n = 10;
		let randomnumbers = new Set(),
			ans;
		while (randomnumbers.size < n) {
			randomnumbers.add(Math.floor(Math.random() * dbQuesLength));
		}
		ans = Array.from(randomnumbers);
		return ans;
	},
	saveAnsweredQuestion: async (pushKey, uid, qIdx, arrQues, isCorrect) => {
		try {
			let endTime = ServerValue.TIMESTAMP;
			let nextQues = arrQues.indexOf(qIdx) + 2;
			const ref = db.ref("Scoreboards/" + pushKey);
			const refqIdxArr = db.ref(`Scoreboards/${pushKey}/${uid}`);
			refqIdxArr.child(qIdx).update({
				correct: isCorrect.userCorrect,
			});
			const snapshot = await refqIdxArr.get();
			const qIdxArr = snapshot.val() || [];
			let countTrue = [];
			if (nextQues - 2 >= 9) {
				let data = {};
				data.endTime = ServerValue.TIMESTAMP;
				for (i in qIdxArr) {
					if (qIdxArr[i].correct == true) {
						countTrue.push({ [i]: qIdxArr[i] });
					}
				}
				data.endTime = endTime;
				data.startTime = qIdxArr.startTime;
				data.endTime = ServerValue.TIMESTAMP;
				data.totalScores = countTrue.length * 10;
				delete qIdxArr.startTime;
				data.userQuestions = qIdxArr;
				ref.set({
					[uid]: data,
				});
			} else {
				ref.set({
					[uid]: qIdxArr,
				});
			}
			return nextQues;
		} catch (e) {
			console.log(e);
		}
	},
	checkAnsAndGetQuestion: async (data, arrQues, res) => {
		try {
			const qIdx = data.qIdx;
			const ref = db.ref("Questions/" + arrQues[qIdx]);
			const isCorrect = await module.exports.checkAns(
				data,
				qIdx,
				arrQues
			);
			const nextQues = await module.exports.saveAnsweredQuestion(
				data.pushKey,
				data.uid,
				arrQues[qIdx - 1],
				arrQues,
				isCorrect
			);
			const snapshot = await ref.get();
			const dbData = snapshot.val();
			let qData = {};
			if (qIdx < 10) {
				qData = {
					ques: dbData.ques,
					ans: dbData.ans.value,
					qIdx: nextQues,
					isCorrect: isCorrect.userCorrect,
					correct: isCorrect.correct,
				};
			} else {
				qData = {
					isCorrect: isCorrect.userCorrect,
					correct: isCorrect.correct,
					redirect: "/game/scoreboards",
				};
			}
			res.json(qData);
		} catch (e) {
			console.log(e);
		}
	},
	checkAns: async (data, qIdx, arrQues) => {
		const ansIdx = data.ansIndex;
		if (qIdx == 0) {
			const ref = db.ref("Questions/" + arrQues[qIdx]);
			const isCorrect = (await ref.get()).val().ans.is_correct;
			return isCorrect[ansIdx].correct;
		}
		const ref = db.ref("Questions/" + arrQues[qIdx - 1]);
		const isCorrect = (await ref.get()).val().ans.is_correct;
		let correct;
		for (i = 0; i < 4; i++)
			if (isCorrect[i].correct) {
				correct = i;
			}
		return { userCorrect: isCorrect[ansIdx].correct, correct: correct };
	},
	getScoreboards: async () => {
		const ref = db.ref("Scoreboards/");
		const allTurn = await ref.get();
		let scoreboards = [];
		allTurn.forEach((turn) => {
			const turnData = turn.val();
			const turnKey = Object.keys(turnData);
			const turnUID = turnKey[0];
			for (i in turnData) {
				let timePlay = turnData[i].endTime - turnData[i].startTime;
				let minutes = Math.floor(timePlay / 1000 / 60);
				let seconds = Math.floor(timePlay / 1000 - minutes * 60);
				if (seconds < 10) seconds = "0" + seconds;
				let timeParse = minutes + " phút " + seconds + "s";
				if (i == turnUID) {
					if (
						!turnData[i].totalScores ||
						timePlay == NaN ||
						timeParse == "NaN phút NaNs"
					)
						continue;
					else {
						scoreboards.push({
							username: turnUID,
							scores: turnData[i].totalScores,
							timePlay: timeParse,
							timeToSort: timePlay,
						});
					}
				}
			}
		});
		scoreboards.sort(
			(a, b) => b.scores - a.scores || a.timeToSort - b.timeToSort
		);
		return scoreboards;
	},
	getRoomInfo: async (uid, name, roomId) => {
		const roomRef = db.ref("rooms/" + roomId);
		const roomInfo = (await roomRef.get()).val();
		if (
			uid == roomInfo.host.hostUID ||
			name == roomInfo.host.hostUID ||
			name == roomInfo.host.userInfo
		) {
			roomInfo.isHost = true;
		} else roomInfo.isHost = false;
		return roomInfo;
	},
	getQuizUserInfo: async (roomInfo) => {
		const hostUID = roomInfo.host.hostUID;
		const clientUID = roomInfo.client.clientUID;
		let data = {
			host: {
				photoUrl: "",
				name: "",
			},
			client: {
				photoUrl: "",
				name: "",
			},
		};
		try {
			let hostInfo = await getAuth().getUser(hostUID);
			data.host.name = hostInfo.displayName;
			data.host.photoUrl = hostInfo.photoURL;
		} catch (e) {
			data.host.photoUrl =
				"https://i.pinimg.com/564x/31/7c/87/317c87f5eec32d4ac39c328069bc9d19.jpg";
			data.host.name = hostUID;
			console.log(e);
		}
		try {
			let clientInfo = await getAuth().getUser(clientUID);
			data.client.name = clientInfo.displayName;
			data.client.photoUrl = clientInfo.photoURL;
		} catch (e) {
			data.client.photoUrl =
				"https://i.pinimg.com/564x/31/7c/87/317c87f5eec32d4ac39c328069bc9d19.jpg";
			data.client.name = clientUID;
			console.log(e);
		}
		data.host.time = roomInfo.host.endTime - roomInfo.startTime;
		data.client.time = roomInfo.client.endTime - roomInfo.startTime;
		data.host.scores = roomInfo.host.scores;
		data.client.scores = roomInfo.client.scores;
		if (roomInfo.endGame === 2) {
			clientTime = data.client.time;
			hostTime = data.host.time;
		}
		let date1 = new Date(clientTime);
		let date2 = new Date(hostTime);
		data.host.timePlay = `${date2.getMinutes()} phút ${date2.getSeconds()}s`;
		data.client.timePlay = `${date1.getMinutes()} phút ${date1.getSeconds()}s`;
		return data;
	},
};
