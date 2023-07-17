const headerLargeText = document.querySelector(".head");
const addCategoryBtn = document.querySelector(".addTag");
const deleteCategoryBtn = document.querySelector(".deleteTag");
const currentTagElm = document.querySelectorAll(".tag-checkbox");
const headerImageUpload = document.querySelector("#headerImage");
const header = document.querySelector(".header");
const updateHeaderBtn = document.querySelector(".update");
const smallTitle = document.querySelector(".small-text");
const largeTitle = document.querySelector(".head");
const updateVideoBtn = document.querySelector(".updateQuiz");
const quizImage = document.querySelector("#quizImage");
const updateQuizImageBtn = document.querySelector(".updateQuizImage");
const setHeightForTextArea = (elm) => {
	elm.style.height = elm.scrollHeight + "px";
};
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
addCategoryBtn.addEventListener("click", () => {
	const newTag = prompt("Nhập tên danh mục bạn muốn thêm");
	let currentTag = [{ [convert_vi_to_en(newTag)]: newTag }];
	currentTagElm.forEach((tag) => {
		currentTag.push({
			[tag.dataset.tag]: tag.children[1].innerHTML,
		});
	});
	const tagUpdate = { currentTag: currentTag };
	$.ajax({
		type: "POST",
		dataType: "json",
		contentType: "application/json",
		data: JSON.stringify(tagUpdate),
		url: "/customize-web/updateTag",
		success: (successData) => {
			window.location = "/customize-web/";
		},
		error: (e) => {
			window.location = "/customize-web/";
		},
	});
});
deleteCategoryBtn.addEventListener("click", () => {
	let currentTag = [];
	currentTagElm.forEach((tag) => {
		if (!tag.children[0].checked)
			currentTag.push({
				[tag.dataset.tag]: tag.children[1].innerHTML,
			});
	});
	const tagUpdate = { currentTag: currentTag };
	if (confirm("Bạn muốn xoá danh mục này?"))
		$.ajax({
			type: "POST",
			dataType: "json",
			contentType: "application/json",
			data: JSON.stringify(tagUpdate),
			url: "/customize-web/updateTag",
			success: (successData) => {
				window.location = "/customize-web/";
			},
			error: (e) => {
				window.location = "/customize-web/";
			},
		});
});
