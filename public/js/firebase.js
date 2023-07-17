import {
	getDownloadURL,
	ref,
	uploadBytes,
	uploadBytesResumable,
	getStorage,
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-storage.js";

const storage = getStorage();
const bannerUpload = document.getElementById("banner-upload");
const blogBanner = document.querySelector(".blog-banner");
const title = document.querySelector(".title");
const overview = document.querySelector(".overview");
const errPopup = document.getElementById("errPopup");
const publishBtn = document.querySelector(".publish");
const imgContent = document.querySelector("#img-upload");
const alertNoti = document.querySelector(".alert");
const editBtn = document.querySelector(".edit");
const blogTag = document.querySelectorAll(".tag-checkbox");

$(".close").click(function () {
	alertNoti.style.transform = "translateX(120%)";
	alertNoti.style.opacity = "0";
});

function convert_vi_to_en(str) {
	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
	str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
	str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
	str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
	str = str.replace(/đ/g, "d");
	str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
	str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
	str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
	str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
	str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
	str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
	str = str.replace(/Đ/g, "D");
	str = str.replace(
		/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
		" "
	);
	str = str.replace(/\s/g, "-");
	str = str.replace(/  +/g, " ");
	return str;
}
if (bannerUpload != null)
	bannerUpload.addEventListener("change", () => {
		const [file] = bannerUpload.files;
		const date = new Date();
		const filename =
			date.getFullYear() +
			date.getMonth() +
			date.getDate() +
			date.getHours() +
			file.name;
		const storageRef = ref(storage, `images/${filename}`);
		if (file) {
			uploadBytes(storageRef, file)
				.catch((err) => {
					console.log(err);
				})
				.then(() => {
					getDownloadURL(ref(storage, `images/${filename}`))
						.then((url) => {
							blogBanner.style.backgroundImage = `url(${url})`;
							alertNoti.style.opacity = "1";
							alertNoti.style.transform = "translateX(0)";
						})
						.catch((err) => {
							console.log(err);
							errPopup.style.display = "flex";
						});
				});
		}
	});
if (imgContent != null)
	imgContent.addEventListener("change", () => {
		const [file] = imgContent.files;
		const date = new Date();
		const filename =
			date.getFullYear() +
			date.getMonth() +
			date.getDate() +
			date.getHours();
		const storageRef = ref(storage, `images/${filename}`);
		if (file) {
			const uploadTask = uploadBytesResumable(storageRef, file);
			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress =
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					if (progress == 100) {
						alertNoti.style.opacity = "1";
						alertNoti.style.transform = "translateX(0)";
					}
				},
				(error) => {
					console.log(error);
				},
				() => {
					getDownloadURL(ref(storage, `images/${filename}`))
						.then((url) => {
							console.log("Working");
							simplemde.value(
								`${simplemde.value()}\n ![](${url})`
							);
						})
						.catch((err) => {
							if (err) {
								console.log(err);
								errPopup.style.display = "flex";
							}
						});
				}
			);
		}
	});

if (editBtn != null) {
	editBtn.addEventListener("click", () => {
		let data = {};
		let bannerImg = blogBanner.style.backgroundImage.toString();
		bannerImg = bannerImg.slice(5, bannerImg.length - 2);
		data.title = title.value;
		data.overview = overview.value;
		data.article = simplemde.value();
		data.bannerImgSrc = bannerImg;
		data.update = true;
		let categoryTag = [];
		blogTag.forEach((tag) => {
			if (tag.children[0].checked) {
				categoryTag.push({
					[convert_vi_to_en(tag.dataset.tag)]:
						tag.children[1].innerHTML,
				});
			}
		});
		data.tag = categoryTag;
		$.ajax({
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
			dataType: "json",
			url: "/upload",
			success: (data) => {
				alertNoti.style.opacity = "1";
				alertNoti.style.transform = "translateX(0)";
				setTimeout(() => {
					window.location = data.redirect;
				}, 2000);
			},
			error: (error) => {
				console.log(error);
			},
		});
	});
}

if (publishBtn != null)
	publishBtn.addEventListener("click", () => {
		let data = {};
		let bannerImg = blogBanner.style.backgroundImage.toString();
		bannerImg = bannerImg.slice(5, bannerImg.length - 2);
		data.title = title.value;
		data.overview = overview.value;
		data.article = simplemde.value();
		data.bannerImgSrc = bannerImg;
		data.id = title.value;
		data.id = data.id.split("?")[0];
		let categoryTag = [];
		blogTag.forEach((tag) => {
			if (tag.children[0].checked) {
				categoryTag.push({
					[convert_vi_to_en(tag.dataset.tag)]:
						tag.children[1].innerHTML,
				});
			}
		});
		if (categoryTag.length == 0) {
			alert("Vui lòng gắn thẻ bài viết");
			return;
		}
		data.tag = categoryTag;
		$.ajax({
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json",
			dataType: "json",
			url: "/upload",
			success: (data) => {
				console.log("success");
				alertNoti.style.opacity = "1";
				alertNoti.style.transform = "translateX(0)";
				setTimeout(() => {
					window.location = data.redirect;
				}, 2000);
			},
			error: (error) => {
				console.log(error);
			},
		});
	});
if (headerImageUpload != null)
	headerImageUpload.addEventListener("change", () => {
		const [file] = headerImageUpload.files;
		const date = new Date();
		const filename =
			date.getFullYear() +
			date.getMonth() +
			date.getDate() +
			date.getHours() +
			file.name;
		const storageRef = ref(storage, `images/${filename}`);
		if (file) {
			uploadBytes(storageRef, file)
				.catch((err) => {
					console.log(err);
				})
				.then(() => {
					getDownloadURL(ref(storage, `images/${filename}`))
						.then((url) => {
							header.setAttribute(
								"style",
								`background: url(${url})`
							);
							header.style.backgroundImage = `url(${url})`;
							console.log(url);
						})
						.catch((err) => {
							console.log(err);
						});
				});
		}
	});
if (updateHeaderBtn != null) {
	updateHeaderBtn.addEventListener("click", () => {
		const headerImageUrl = header
			.getAttribute("style")
			.slice(12, header.getAttribute("style").length);
		const smallText = smallTitle.value;
		const largeText = largeTitle.value;
		const data = {
			headerImageUrl: headerImageUrl,
			smallText: smallText,
			largeText: largeText,
		};
		$.ajax({
			type: "POST",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data),
			url: "/customize-web/updateHeader",
			success: (successData) => {
				window.location = "/customize-web/";
			},
			error: (e) => {
				window.location = "/customize-web/";
			},
		});
	});
}
if (updateVideoBtn != null) {
	updateVideoBtn.addEventListener("click", () => {
		const largeVideoUrl = document.getElementById("largeVideo");
		const smallVideo1Url = document.getElementById("smallVideo1");
		const smallVideo2Url = document.getElementById("smallVideo2");
		const data = {
			largeVideoUrl: largeVideoUrl.value,
			smallVideo1Url: smallVideo1Url.value,
			smallVideo2Url: smallVideo2Url.value,
		};
		$.ajax({
			type: "POST",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data),
			url: "/customize-web/updateVideo",
			success: (data) => {
				window.location = "/customize-web/";
			},
			error: (e) => {
				window.location = "/customize-web/";
			},
		});
	});
}
if (quizImage != null) {
	quizImage.addEventListener("change", () => {
		const [file] = quizImage.files;
		const date = new Date();
		const filename =
			date.getFullYear() +
			date.getMonth() +
			date.getDate() +
			date.getHours() +
			file.name;
		const storageRef = ref(storage, `images/${filename}`);
		if (file) {
			uploadBytes(storageRef, file)
				.catch((err) => {
					console.log(err);
				})
				.then(() => {
					getDownloadURL(ref(storage, `images/${filename}`))
						.then((url) => {
							quizImage.parentElement.setAttribute(
								"style",
								`background: url(${url})`
							);
							quizImage.parentElement.style.backgroundImage = `url(${url})`;
							console.log(url);
						})
						.catch((err) => {
							console.log(err);
						});
				});
		}
	});
}
if (updateQuizImageBtn != null) {
	updateQuizImageBtn.addEventListener("click", () => {
		const quizImageUrl = quizImage.parentElement
			.getAttribute("style")
			.slice(12, quizImage.parentElement.getAttribute("style").length);
		const data = {
			quizImageUrl: quizImageUrl,
		};
		$.ajax({
			type: "POST",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data),
			url: "/customize-web/updateQuizImage",
			success: (data) => {
				window.location = "/customize-web/";
			},
			error: (e) => {
				window.location = "/customize-web/";
			},
		});
	});
}
