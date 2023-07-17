const createBtn = document.querySelector(".createBtn");
const continueBtn = document.querySelector(".continue");
const inpName = document.querySelector("#name");
let uid = document.querySelector(".game-container").dataset.id;
const pushKey = document.querySelector(".game-container").dataset.key;
const quesIdx = document.querySelector("#qIdx");
const score = document.querySelector("#score");
const countDownTime = document.querySelector("#time");
const leftArrow = document.querySelector(".fa-arrow-left");
const rightArrow = document.querySelector(".fa-arrow-right");
const spBtn = document.querySelector(".support");
const overlay = document.querySelector(".overlay");
const ruleBox = document.querySelector(".rule-box");
const speech = new SpeechSynthesisUtterance();
const webkitSpeechRecognition =
	window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new webkitSpeechRecognition();
recognition.lang = "vi-VN";
speech.lang = "vi";
let pageCnt = 0;

if (spBtn != null) {
	spBtn.addEventListener("click", () => {
		overlay.style.display = "block";
		ruleBox.style.display = "flex";
	});
}
overlay.addEventListener("click", () => {
	overlay.style.display = "none";
	ruleBox.style.display = "none";
});
if (inpName != null) {
	continueBtn.style.pointerEvents = "none";
	createBtn.style.pointerEvents = "none";
	inpName.addEventListener("change", () => {
		if (regEx.test(inpName.value)) {
			inpName.style.border = "1px solid black";
			continueBtn.style.pointerEvents = "auto";
			createBtn.style.pointerEvents = "auto";
		} else {
			inpName.style.border = "1px red solid";
			alert("Vui lòng nhập tên");
		}
	});
}
if (document.querySelector(".micro"))
	document.querySelector(".micro").addEventListener("click", () => {
		recognition.start();
	});
const decodeHtml = (html) => {
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
};

function lcs(a, b) {
	const matrix = Array(a.length + 1)
		.fill()
		.map(() => Array(b.length + 1).fill(0));
	for (let i = 1; i < a.length + 1; i++) {
		for (let j = 1; j < b.length + 1; j++) {
			if (a[i - 1] === b[j - 1]) {
				matrix[i][j] = 1 + matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
			}
		}
	}
	return matrix[a.length][b.length];
}

const data = decodeHtml(scoreboardsData) || "";
const showQuesAns = (data) => {
	const questionBlock = document.querySelector("#question-title");
	questionBlock.innerHTML = data.ques;
	for (let i = 0; i < 4; i++) {
		document.getElementById(i).innerHTML = data.ans[i].ans_value;
	}
};
const btnStatus = (elm, btnstatus) => {
	for (i = 0; i < elm.length; i++) {
		elm[i].style.pointerEvents = btnstatus;
	}
};
const showScores = (scoreboards, start, end) => {
	let data = JSON.parse(scoreboards);
	const userRow = document.querySelectorAll(".user-info");
	const table = document.querySelector(".user-table");
	if (start < end)
		for (let i = start; i <= end; i++) {
			if (data[i] == undefined) {
				userRow[i - 10].remove();
				continue;
			}
			userRow[i - 10].children[0].innerHTML = data[i].username;
			userRow[i - 10].children[1].innerHTML = data[i].scores;
			userRow[i - 10].children[2].innerHTML = data[i].timePlay;
		}
	if (start >= end) {
		for (let i = end; i <= start; i++) {
			if (userRow[end + i] == undefined) {
				const div = document.createElement("div");
				div.classList.add("user-info");
				div.setAttribute(
					"style",
					"background-color: rgba(255, 255, 255, 0.76)"
				);
				div.innerHTML += `
				<p>${data[end + i].username}</p>
				<p>${data[end + i].scores}</p>
				<p>${data[end + i].timePlay}</p>
				`;
				table.appendChild(div);
			} else {
				userRow[end + i].children[0].innerHTML = data[end + i].username;
				userRow[end + i].children[1].innerHTML = data[end + i].scores;
				userRow[end + i].children[2].innerHTML = data[end + i].timePlay;
			}
		}
	}
};
const seeMoreScores = (direction, pageCnt) => {
	if (direction == "RIGHT") {
		pageCnt += 1;
		showScores(data, pageCnt * 10, pageCnt * 10 + 9);
	} else if (direction == "LEFT") {
		showScores(data, pageCnt * 10 + 9, pageCnt * 10);
		if (pageCnt > 0) {
			pageCnt -= 1;
		}
	}
	return;
};
if (rightArrow != null)
	rightArrow.addEventListener("click", () => {
		seeMoreScores("RIGHT", pageCnt);
	});
if (leftArrow != null)
	leftArrow.addEventListener("click", () => {
		seeMoreScores("LEFT", pageCnt);
	});
const countDown = () => {
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
				quesIdx.innerHTML = qIdx;
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
			if (qIdx != undefined) {
				showQuesAns(datas);
				quesIdx.innerHTML = qIdx;
			}
		}, 1500);
	}
};
var qIdx = 0;
const reqAns = (ansIdx) => {
	let data = {
		ansIndex: ansIdx,
		qIdx: qIdx,
		uid: uid,
		pushKey: pushKey,
	};
	$.ajax({
		type: "POST",
		data: JSON.stringify(data),
		contentType: "application/json",
		dataType: "json",
		url: "/game/getQuestion/",
		success: (datas) => {
			qIdx = datas.qIdx;
			ansStatus(datas.isCorrect, data.ansIndex, datas.correct, datas);
			if (datas.redirect != null) {
				window.location = datas.redirect;
			}
		},
		error: (error) => {
			console.log(error);
		},
	});
};
if (continueBtn != null)
	continueBtn.addEventListener("click", () => {
		if (!uid) {
			uid = inpName.value;
		}
		let data = {
			qIdx: qIdx,
			uid: uid,
			pushKey: pushKey,
		};
		document.querySelector(".name-input").style.display = "none";
		document.querySelector(".hud-info").style.display = "flex";
		document.querySelector(".micro").style.display = "flex";
		document.querySelector(".game-area").style.display = "flex";
		$.ajax({
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify(data),
			dataType: "json",
			url: "/game/getQuestion",
			success: (datas) => {
				qIdx = datas.qIdx;
				countDown();
				showQuesAns(datas);
			},
			error: (error) => {
				console.log(error);
			},
		});
	});
recognition.onresult = (e) => {
	const recResult = e.results[0][0].transcript;
	const choiceBtn = document.querySelectorAll(".choice-content");
	let res = 0;
	let likely = 0;
	let max = 0;
	for (i = 0; i < 4; i++) {
		likely = lcs(choiceBtn[i].textContent, recResult);
		if (max <= likely) {
			res = i;
			max = likely;
		}
	}
	const LIKELY_PERCENT = Math.floor(
		(65 / 100) * choiceBtn[res].textContent.length
	);
	if (max >= LIKELY_PERCENT) reqAns(res);
	else alert("Vui lòng đọc lại");
};
