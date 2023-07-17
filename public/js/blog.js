const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const likeCommentBtn = document.querySelector(".like-comment");
const dislikeCommentBtn = document.querySelector(".dislike-comment");
const commentInput = document.querySelector(".comment-input");
const sendComment = document.querySelector(".send");
const blogId = document.querySelector(".main-content").dataset.id;
likeBtn.addEventListener("click", () => {
	let status;
	if (likeBtn.classList.contains("like")) {
		likeBtn.classList.remove("like");
		status = "unlike";
	} else {
		if (dislikeBtn.classList.contains("dislike"))
			dislikeBtn.classList.remove("dislike");
		likeBtn.classList.toggle("like");
		status = "like";
	}
	$.ajax({
		type: "POST",
		dataType: "application/JSON",
		data: { blogId: blogId },
		url: location.href + "/" + status,
		success: (data) => {
			console.log(data);
		},
		error: (e) => {
			console.log(e);
		},
	});
});
dislikeBtn.addEventListener("click", () => {
	let status;
	if (dislikeBtn.classList.contains("dislike")) {
		dislikeBtn.classList.remove("dislike");
		status = "undislike";
	} else {
		if (likeBtn.classList.contains("like"))
			likeBtn.classList.remove("like");
		dislikeBtn.classList.toggle("dislike");
		status = "dislike";
	}
	$.ajax({
		type: "POST",
		dataType: "application/JSON",
		data: { blogId: blogId },
		url: location.href + "/" + status,
		success: (data) => {
			console.log(data);
		},
		error: (e) => {
			console.log(e);
		},
	});
});
sendComment.addEventListener("click", () => {
	let data = {
		commentContent: commentInput.value,
		blogId: blogId,
	};
	$.ajax({
		type: "POST",
		dataType: "application/JSON",
		data: { data: data },
		url: location.href + "/post-comment",
		success: (res) => {},
		error: (e) => {},
	});
});
