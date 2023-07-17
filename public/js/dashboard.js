const user = document.querySelector("#usN");
const email = document.querySelector("#email");
const pwd = document.querySelector("#pwd");
const signIn = document.querySelector("#loginBtn");
const signUp = document.querySelector(".signUp");
let errBlock = document.querySelector(".error");
const openMenuBtn = document.querySelector(".open");
const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".overlay");
const closeMenuBtn = document.querySelector(".fa-close");
const forgot = document.querySelector(".forgot");

if (openMenuBtn != null)
	openMenuBtn.addEventListener("click", () => {
		if (
			document.querySelector(".menu-btn").style.transform !=
			"translateX(250px)"
		) {
			document.querySelector(".overlay").style.display = "block";
			document.querySelector(".menu-btn").style.transform =
				"translateX(250px)";
			sidebar.style.opacity = "1";
			sidebar.style.transform = "translateX(0)";
			document.querySelector(".fa-close").style = "block";
			openMenuBtn.children[0].style.display = "none";
			closeMenuBtn.style.display = "block";
		} else {
			document.querySelector(".overlay").style.display = "none";
			closeMenuBtn.style.display = "none";
			document.querySelector(".menu-btn").style.transform =
				"translateX(0)";
			sidebar.style.opacity = "1";
			sidebar.style.transform = "translateX(-250px)";
			openMenuBtn.children[0].style.display = "block";
		}
	});
if (signIn != null) {
	signIn.addEventListener("click", () => {
		const data = {
			email: user.value,
			pwd: pwd.value,
		};
		$.ajax({
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
			dataType: "json",
			url: "/user",
			success: (data) => {
				if (data.redirect != undefined) {
					window.location.href = data.redirect;
				} else {
					errBlock.style.display = "flex";
					errBlock.innerHTML = data.code;
				}
			},
			error: (error) => {
				console.log(error);
			},
		});
	});
}
if (signUp != null)
	signUp.addEventListener("click", () => {
		const data = {
			email: email.value,
			pwd: pwd.value,
			accountName: user.value,
		};
		$.ajax({
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
			dataType: "json",
			url: "/user/register",
			success: (data) => {
				if (data.redirect != undefined) {
					window.location.href = data.redirect;
				} else {
					errBlock.style.display = "flex";
					errBlock.innerHTML = data.code;
				}
			},
			error: (error) => {
				console.log(error);
			},
		});
	});
const deletePost = (elm, path) => {
	let docId = elm.parentNode.parentNode.dataset.id;
	let data = {
		docs: docId,
	};
	$.ajax({
		type: "POST",
		data: JSON.stringify(data),
		contentType: "application/json",
		dataType: "json",
		url: `/blog${path}/${docId}/delete`,
		success: (data) => {
			location.href = data.redirect;
		},
		error: (err) => {
			console.log(err);
		},
	});
};
const browseBlog = (elm) => {
	let docId = elm.parentNode.parentNode.dataset.id;
	let data = {
		blogId: docId,
	};
	$.ajax({
		type: "POST",
		data: JSON.stringify(data),
		contentType: "application/json",
		dataType: "json",
		url: `/blog/browse/${docId}`,
		success: (data) => {},
		error: (err) => {
			console.log(err);
		},
	});
};
var regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
if (email != null)
	email.addEventListener("keyup", () => {
		const userEmail = document.querySelector("#email");
		if (!regex.test(userEmail.value)) {
			email.style.border = "1px solid red";
		} else {
			email.style.border = "1px solid black";
		}
	});
const forgotPwd = (elm) => {
	const email = elm.value;
	let data = {};
	data.email = email;
	$.ajax({
		type: "POST",
		data: JSON.stringify(data),
		contentType: "application/json",
		dataType: "json",
		url: `/user/forgotpassword`,
		success: (data) => {
			const authContainer = document.getElementById("auth-container");
			const p = document.createElement("p");
			p.setAttribute("style", "margin:10px 30px; text-align:center;");
			p.innerHTML =
				"Vui lòng kiểm tra hộp thư đến hoặc spam, thư có thể gửi chậm 2 đến 3p vui lòng đợi. Nếu bạn vẫn chưa nhận được thư, hãy nhấn nút quên mật khẩu lần nữa";
			authContainer.appendChild(p);
		},
		error: (err) => {
			console.log(err);
		},
	});
};
if (forgot != null)
	forgot.addEventListener("click", () => {
		if (regex.test(email.value)) {
			forgotPwd(email);
		}
	});
