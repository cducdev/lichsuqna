const inpName = document.querySelector("#name");
const continueBtn = document.querySelector(".continue");
const gameContainer = document.querySelector(".game-container");
const host = document.querySelector("#host");
const client = document.querySelector("#client");
const waitBox = document.querySelector(".wait-box");
const memberCount = document.getElementById("memberCount");
const roomMember = document.querySelector(".room-member");
const rtScoreboards = document.querySelectorAll(".user-info");
const quesIdx = document.getElementById("qIdx");
const currRanking = document.getElementById("currRanking");
const clientInScoreboard = document.getElementById("client-info");
const hostInScoreboard = document.getElementById("host-info");
const allPlayer = document.querySelectorAll(".user-info");
const webkitSpeechRecognition =
	window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new webkitSpeechRecognition();
recognition.lang = "vi-VN";
var qIdx = 0;
const showQuesAns = (data) => {
	document.getElementById("question-title").textContent = data.ques;
	for (let i = 0; i < 4; i++) {
		document.getElementById(i).textContent = data.ans[i].ans_value;
	}
};

const countDownTimer = () => {
	let timeplay = 300;
	let time = document.querySelector("#time");
	setInterval(() => {
		let min = timeplay / 60;
		let secs = (min % 1) * 60;
		min = Math.floor(min);
		secs = Math.round(secs);
		if (min < 10) min = "0" + min;
		if (secs < 10) secs = "0" + secs;
		if (parseInt(min) < 1) {
			time.style.color = "red";
		}
		time.textContent = min + ":" + secs;
		timeplay = timeplay - 1;
		if (timeplay === 0) socket.emit("end-game", room, userInfo);
	}, 1000);
};

const sendAns = (e, ansIdx) => {
	e.setAttribute("onclick", "none");
	if (qIdx < 10)
		socket.emit(
			"check-ans",
			JSON.parse(getQuesArrFromCookies()),
			qIdx,
			ansIdx,
			room,
			userInfo
		);
};
const countDownGame = () => {
	let timeplay = 600;
	let time = document.querySelector("#time");
	setInterval(() => {
		let min = timeplay / 60;
		let secs = (min % 1) * 60;
		min = Math.floor(min);
		secs = Math.round(secs);
		if (min < 10) min = "0" + min;
		if (secs < 10) secs = "0" + secs;
		if (parseInt(min) < 1) {
			time.style.color = "red";
		}
		time.innerHTML = min + ":" + secs;
		timeplay = timeplay - 1;
	}, 1000);
};

const ansStatus = (boolean, ansIdx, correctAns, datas) => {
	const ansBlock = document.getElementById(ansIdx);
	const choiceBtn = document.querySelectorAll(".choice");
	if (boolean) {
		ansBlock.parentElement.style.backgroundColor = "lime";
		ansBlock.parentElement.style.opacity = "0.7";
		btnStatus(choiceBtn, "none");
		setTimeout(() => {
			ansBlock.parentElement.style.backgroundColor = "#fff";
			ansBlock.parentElement.style.opacity = "1";
			btnStatus(choiceBtn, "auto");
			if (qIdx != undefined) {
				showQuesAns(datas);
				quesIdx.innerHTML = qIdx + 1;
				score.innerHTML = parseInt(score.innerHTML) + 10;
			}
		}, 1500);
	} else {
		ansBlock.parentElement.style.backgroundColor = "rgb(220,20,60)";
		ansBlock.parentElement.style.opacity = "0.7";
		choiceBtn[correctAns].style.backgroundColor = "lime";
		choiceBtn[correctAns].style.opacity = "0.7";
		btnStatus(choiceBtn, "none");
		setTimeout(() => {
			ansBlock.parentElement.style.backgroundColor = "#fff";
			ansBlock.parentElement.style.opacity = "1";
			choiceBtn[correctAns].style.backgroundColor = "#fff";
			choiceBtn[correctAns].style.opacity = "1";
			btnStatus(choiceBtn, "auto");
			if (qIdx < 10) {
				showQuesAns(datas);
				quesIdx.innerHTML = qIdx + 1;
			}
		}, 1500);
	}
};
const btnStatus = (elm, btnstatus) => {
	for (i = 0; i < elm.length; i++) {
		elm[i].style.pointerEvents = btnstatus;
	}
};
const getQuesArrFromCookies = () => {
	let cookies = document.cookie;
	let result = "";
	let start = cookies.indexOf("[");
	let end = cookies.indexOf("]");
	for (let i = start; i <= end; i++) result += cookies[i];
	return result;
};

let userInfo = gameContainer.dataset.id || gameContainer.dataset.name;
if (inpName != null) {
	continueBtn.style.pointerEvents = "none";
	inpName.addEventListener("change", () => {
		if (regEx.test(inpName.value)) {
			inpName.style.border = "1px solid black";
			continueBtn.style.pointerEvents = "auto";
		} else {
			inpName.style.border = "1px red solid";
			alert("Vui lòng nhập tên");
		}
	});
}
if (continueBtn != null)
	continueBtn.addEventListener("click", () => {
		userInfo = userInfo || inpName.value;
		socket.emit("join-room", room, userInfo);
	});
socket.on("newUserJoined", (clientLength, clientInfo) => {
	client.textContent = clientInfo;
	host.textContent = gameContainer.dataset.hostname;
	if (inpName != null) {
		inpName.style.display = "none";
	}
	if (continueBtn != null) {
		continueBtn.style.display = "none";
	}
	document.querySelector(".name-input").children[0].style.display = "none";
	waitBox.style.display = "block";
	rtScoreboards[1].children[0].textContent = clientInfo;
	memberCount.textContent = clientLength - 1 || "1" || "2";
});
socket.on("generate-ques", (quesIdxArr) => {
	document.cookie = `questions=[${quesIdxArr}];expires=600000;path=/`;
	let waitBoxHeading = waitBox.children[0];
	let sec = 5000;
	waitBoxHeading.textContent = "Vui lòng chờ trong";
	let countDown = setInterval(() => {
		if (sec == 0) {
			clearInterval(countDown);
			socket.emit(
				"get-question",
				JSON.parse(getQuesArrFromCookies()),
				qIdx,
				room
			);
			document.querySelector(".name-input").style.display = "none";
			gameContainer.children[0].style.display = "block";
			gameContainer.children[1].style.display = "block";
			gameContainer.children[0].style.height =
				gameContainer.children[1].offsetHeight;
		}
		roomMember.children[0].textContent = sec / 1000;
		sec -= 1000;
	}, 1000);
	countDown;
});
socket.on("roomFulled", (msg) => {
	console.log("FULL");
});
$(window).on("beforeunload", () => {
	socket.emit("leave-room", room, client.textContent);
});
socket.on("return-question", (data) => {
	showQuesAns(data);
	countDownGame();
});
socket.on(
	"check-success",
	(isCorrect, correctAns, ansIdx, nextIdx, nextQues) => {
		let choice = document.querySelectorAll(".choice");
		qIdx = nextIdx;
		ansStatus(isCorrect, ansIdx, correctAns, nextQues);
		choice[ansIdx].setAttribute("onclick", `sendAns(this,${ansIdx})`);
	}
);
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
socket.on("update-scoreboards", async (data, qIdx) => {
	let currQIdx = qIdx;
	let i = 0;
	allPlayer.forEach((user) => {
		user.children[0].textContent = data[i].userInfo;
		user.children[1].textContent = data[i].scores;
		if (
			userInfo == data[i].userInfo ||
			userInfo == data[i].clientUID ||
			userInfo == data[i].hostUID
		)
			currRanking.textContent = i + 1;
		i += 1;
	});
	if (currQIdx >= 11) {
		let nameInpDiv = document.querySelector(".name-input");
		await delay(1500);
		for (let i = 0; i < 3; i++)
			gameContainer.children[i].style.display = "none";
		nameInpDiv.style.display = "flex";
		if (!!nameInpDiv.children[1]) {
			nameInpDiv.children[1].style.display = "none";
		}
		waitBox.children[0].textContent = "Đang đợi người chơi còn lại";
		roomMember.children[0].innerHTML = "<span id='memberCount'>1</span>/2";
		socket.emit("end-game", room, userInfo);
	}
});
$(window).on("beforeunload", () => {
	socket.emit("leave-room", room, userInfo);
	console.log("AAA");
});
socket.on("end-game", (data, uInfo, result) => {
	document.getElementById("memberCount").textContent = data.endGame;
	if (data.endGame === 2) {
		waitBox.children[0].textContent = "Kết quả sẽ có sau";
		let sec = 5000;
		let countDown = setInterval(() => {
			roomMember.children[0].textContent = sec / 1000;
			if (sec === 0) {
				const resultBoard = gameContainer.children[3];
				const allUserResult = document.querySelectorAll(".user-result");
				clearInterval(countDown);
				document.querySelector(".name-input").style.display = "none";
				resultBoard.style.display = "flex";
				let i = 0;
				allUserResult.forEach((userResult) => {
					userResult.children[0].setAttribute(
						"src",
						result[i].photoUrl
					);
					userResult.children[2].textContent = result[i].name;
					userResult.children[3].textContent =
						result[i].scores + " điểm";
					userResult.children[4].textContent = result[i].timePlay;
					i += 1;
				});
			}
			sec -= 1000;
		}, 1000);
		countDown;
	}
});
