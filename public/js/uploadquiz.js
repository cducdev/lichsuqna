const addQuizBtn = document.querySelector(".btn");
const alertNoti = document.querySelector(".alert");
const ansCorrect = document.querySelectorAll("#ansCorrect");
const checkChange = (elm) => {
	elm.addEventListener("change", () => {
		if (elm.value == "TRUE") {
			ansCorrect.forEach((ans) => {
				if (elm !== ans) ans.value = "FALSE";
			});
		}
	});
};
alertNoti.children[1].addEventListener("click", () => {
	alertNoti.style.transform = "translateX(120%)";
	alertNoti.style.opacity = "0";
});
addQuizBtn.addEventListener("click", () => {
	var datas = {
		ans: {
			is_correct: [],
			value: [],
		},
	};
	let isCorrect = document.querySelectorAll("#ansCorrect");
	let ansVal = document.querySelectorAll(".choice-content");
	let question = document.querySelector("#question");
	isCorrect.forEach((corrects) => {
		const is_correct = corrects.value === "TRUE";
		datas.ans.is_correct.push({ correct: is_correct });
	});
	ansVal.forEach((val) => {
		datas.ans.value.push({ ans_value: val.value });
	});
	datas.ques = question.value;
	console.log(datas);
	$.ajax({
		type: "POST",
		data: JSON.stringify(datas),
		contentType: "application/json",
		dataType: "json",
		url: "/uploadQuiz",
		success: (data) => {
			console.log("success");
			console.log(JSON.stringify(data));
			alertNoti.style.opacity = "1";
			alertNoti.style.transform = "translateX(0)";
		},
		error: (error) => {
			console.log(error);
		},
	});
});
