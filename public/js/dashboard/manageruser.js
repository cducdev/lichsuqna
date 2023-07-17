const group = document.querySelector(".action-btn-group");
const overlayElm = document.querySelector(".overlay");
const submitBtn = document.querySelector(".submit-info");
const editForm = document.querySelector(".edit-form");
const listRoles = document.querySelectorAll(".list-role");
const changeRole = (elm) => {
	const actionBtnGr = elm.parentElement;
	const userInfo = actionBtnGr.parentElement;
	const userEmail = userInfo.children[1].innerHTML;
	popUpEditForm();

	submitBtn.addEventListener("click", () => {
		listRoles.forEach((role) => {
			let data = {
				email: userEmail,
				changeRole: true,
			};
			if (role.style.display == "flex") {
				data.role = role.innerHTML;
				$.ajax({
					type: "POST",
					contentType: "Application/JSON",
					dataType: "JSON",
					data: JSON.stringify(data),
					url: "/user/edit-profile",
					success: (data) => {
						window.location = data.redirect;
					},
					error: (err) => {
						console.log(err);
					},
				});
			}
		});
	});
};
const chooseRole = (elm) => {
	const sameElm = document.querySelectorAll("." + elm.className);
	sameElm.forEach((roleElm) => {
		roleElm.style.display = "none";
	});
	elm.style.display = "flex";
	elm.addEventListener("mouseover", () => {
		sameElm.forEach((roleElm) => {
			roleElm.style.display = "flex";
		});
	});
};
const deleteUser = (elm) => {
	const actionBtnGr = elm.parentElement;
	const userInfo = actionBtnGr.parentElement;
	const userEmail = userInfo.children[1].innerHTML;
	const isDelete = confirm("Bạn muốn xoá người dùng này?");
	if (isDelete) {
		let data = {
			email: userEmail,
		};
		$.ajax({
			type: "POST",
			contentType: "Application/JSON",
			dataType: "JSON",
			data: JSON.stringify(data),
			url: "/user/delete/" + userEmail,
			success: (data) => {
				window.location = data.redirect;
			},
			error: (e) => {
				console.log(e);
			},
		});
	}
};
const popUpEditForm = () => {
	overlayElm.style.display = "block";
	editForm.style.opacity = "1";
	editForm.style.transform = "scale(1)";
};
overlayElm.addEventListener("click", () => {
	overlayElm.style.display = "none";
	editForm.style.opacity = "0";
	editForm.style.transform = "scale(0)";
});
