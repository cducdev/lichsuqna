import {
	getDownloadURL,
	ref,
	uploadBytes,
	getStorage,
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-storage.js";
const editBtn = document.querySelector(".square");
const overlayElm = document.querySelector(".overlay");
const username = document.querySelector(".name");
const useremail = document.querySelector(".email");
const avatarFile = document.querySelector("#avatar-upload");
const editForm = document.querySelector(".edit-form");
const submitBtn = document.querySelector(".submit-info");
const editAvatar = document.querySelector(".editMode");
const storage = getStorage();
editBtn.addEventListener("click", () => {
	overlayElm.style.display = "block";
	editForm.style.opacity = "1";
	editForm.style.transform = "scale(100%)";
});
overlayElm.addEventListener("click", () => {
	overlayElm.style.display = "none";
	editForm.style.opacity = "0";
	editForm.style.transform = "scale(0)";
});
avatarFile.addEventListener("change", () => {
	const [file] = avatarFile.files;
	const date = new Date();
	const filename =
		date.getFullYear() +
		date.getMonth() +
		date.getDate() +
		date.getHours() +
		file.name;
	const storageRef = ref(storage, `avatar/${filename}`);
	if (file) {
		uploadBytes(storageRef, file)
			.catch((err) => {
				console.log(err);
			})
			.then(() => {
				getDownloadURL(ref(storage, `avatar/${filename}`))
					.then((url) => {
						editAvatar.setAttribute("src", url);
					})
					.catch((err) => {
						console.log(err);
					});
			});
	}
});
useremail.addEventListener("keyup", () => {
	if (!regex.test(useremail.value)) {
		useremail.style.borderBottom = "2px red solid";
		submitBtn.style.pointerEvents = "none";
	} else {
		useremail.style.borderBottom = "1px black solid";
		submitBtn.style.pointerEvents = "auto";
	}
});

submitBtn.addEventListener("click", () => {
	let data = {};
	data.displayName = username.value;
	data.photoURL = editAvatar.getAttribute("src");
	data.email = useremail.value;
	data.phoneNumber = document.querySelector(".phoneNumber").value;
	$.ajax({
		type: "POST",
		data: JSON.stringify(data),
		contentType: "Application/JSON",
		dataType: "JSON",
		url: "/user/edit-profile",
		success: (returnData) => {
			window.location = returnData.redirect;
		},
		error: (err) => {
			console.log(err);
		},
	});
});
