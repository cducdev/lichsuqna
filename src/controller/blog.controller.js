const userModelFn = require("../model/user.model");
const authModelFn = require("../model/auth.model");
const _ = require("lodash");
const {
	createMatrix,
	recommendPost,
} = require("../model/recommendation.model");
const admin = require("firebase-admin");
const firestore = require("../firebase/firestore");
const { FieldValue } = require("firebase-admin/firestore");
const markdown = require("markdown").markdown;
function chuanHoa(str) {
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
	return str;
}
module.exports = {
	indexPage: async (req, res) => {
		const session = req.cookies.session || "";
		const blogData = await userModelFn.getBlog("", true);
		blogData.forEach((blog) => {
			let blogTag = [];
			blog.categoryTag.forEach((tag) => {
				blogTag.push(Object.keys(tag));
			});
			blog.categoryTag = blogTag;
		});
		const tagData = (
			await firestore.collection("web-data").doc("detail").get()
		).data().currentTag;
		let tagArr = [];
		tagData.forEach((tag) => {
			for (key in tag) {
				tagArr.push({ key: key, value: tag[key] });
			}
		});
		let isAuth = await authModelFn.isAuth(session);
		if (isAuth != undefined) isAuth = true;
		else isAuth = false;
		res.render("category", {
			Auth: isAuth,
			blog: blogData,
			categoryTags: "all",
			tagArr: tagArr,
		});
	},
	blogPage: async (req, res) => {
		const session = req.cookies.session || "";
		const isAuth = await authModelFn.isAuth(session);
		const blogId = decodeURI(req.params.blogId);
		let userLike = false;
		let userDislike = false;
		let blogData = (await userModelFn.getBlogData(blogId)).data();
		if (isAuth) {
			userData = await firestore.collection("user").doc(isAuth.uid).get();
			userData = userData.data();
			blogData.categoryTag.forEach((tag) => {
				for (key in tag) {
					userData.category.forEach((elm) => {
						if (elm.lable == key) {
							elm.views += 1;
						}
					});
				}
			});
			await firestore.collection("user").doc(isAuth.uid).update({
				category: userData.category,
			});
		}
		const uid = blogData.authorUID;
		const authorInfo = await admin.auth().getUser(uid);
		timeUpload = blogData.writeTime.toDate().toLocaleDateString();
		blogData.writeTime = timeUpload;
		blogData.article = markdown.toHTML(blogData.article);
		if (blogData.categoryTag != [] && blogData.categoryTag != undefined) {
			let tagArr = [];
			blogData.categoryTag.forEach((tag) => {
				tagArr.push(Object.values(tag)[0]);
			});
			blogData.categoryTag = tagArr;
		} else blogData.categoryTag = ["Other"];
		let browser = {};
		if (authorInfo.customClaims.role != "Thành viên") {
			browser.displayName = authorInfo.displayName;
		} else
			browser = await admin
				.auth()
				.getUser(blogData.browserID || blogData.authorUID);

		await firestore
			.collection("post-data")
			.doc(blogData.id)
			.update({
				views: FieldValue.increment(1),
			});
		if (isAuth) {
			if (userData.likedPost.includes(blogData.id)) userLike = true;
			if (userData.dislikedPost.includes(blogData.id)) userDislike = true;
		}
		const comments = [...blogData.comments];
		const newComments = await Promise.all(
			comments.map(async (comment) => {
				const uInfo = await admin.auth().getUser(comment.uid);
				return {
					...comment,
					writeTime: comment.writeTime.toDate().toLocaleDateString(),
					username: uInfo.displayName,
					userAvatar: uInfo.photoURL,
				};
			})
		);
		res.render("blog", {
			Auth: isAuth != undefined,
			blog: blogData,
			author: authorInfo,
			browser: browser.displayName,
			dislike: userDislike,
			comments: newComments,
			like: userLike,
		});
	},
	deleteBlog: async (req, res) => {
		try {
			let collection = req.originalUrl.split("/")[2];
			if (collection != "pending") {
				collection = "post-data";
			}
			const session = req.cookies.session || "";
			const userInfo = await authModelFn.isAuth(session);
			const currentUserUID = userInfo.uid;
			const blogId = req.params.blogId;
			const deleteBlog = await userModelFn.deleteUserBlog(
				currentUserUID,
				userInfo.role,
				blogId,
				collection
			);
			if (deleteBlog == false) {
				res.status(401);
			} else {
				res.json({ redirect: "/user" });
			}
		} catch (e) {
			console.log(e);
			res.status(401);
		}
	},
	browserBlog: async (req, res) => {
		try {
			const idToken = req.cookies.session;
			const blogId = req.body.blogId;
			const userInfo = await userModelFn.getUserInfo(idToken);
			if (userInfo.role == "Thành viên") {
				res.redirect("/");
			} else {
				await userModelFn.browseBlog(blogId, userInfo.uid);
				res.redirect("/user");
			}
		} catch (e) {
			console.log(e);
			res.status(401);
		}
	},
	categoryTagPage: async (req, res) => {
		const session = req.cookies.session || "";
		const blogData = await userModelFn.getBlogWithFilter(
			req.params.blogCategorytag
		);
		blogData.forEach((blog) => {
			let blogTag = [];
			blog.categoryTag.forEach((tag) => {
				blogTag.push(Object.keys(tag));
			});
			blog.categoryTag = blogTag;
		});
		const tagData = (
			await firestore.collection("web-data").doc("detail").get()
		).data().currentTag;
		let tagArr = [];
		tagData.forEach((tag) => {
			for (key in tag) {
				tagArr.push({ key: key, value: tag[key] });
			}
		});
		let isAuth = await authModelFn.isAuth(session);
		if (isAuth != undefined) isAuth = true;
		else isAuth = false;
		res.render("category", {
			Auth: isAuth,
			blog: blogData,
			categoryTags: req.params.blogCategorytag,
			tagArr: tagArr,
		});
	},
	readPendingBlog: async (req, res) => {
		const session = req.cookies.session || "";
		const isAuth = await authModelFn.isAuth(session);
		const blogId = decodeURI(req.params.blogId);
		let blogData = (
			await firestore.collection("pending").doc(blogId).get()
		).data();
		const uid = blogData.authorUID;
		const authorInfo = await admin.auth().getUser(uid);
		timeUpload = blogData.writeTime.toDate().toLocaleDateString();
		blogData.writeTime = timeUpload;
		blogData.article = markdown.toHTML(blogData.article);
		if (blogData.categoryTag != [] && blogData.categoryTag != undefined) {
			let tagArr = [];
			blogData.categoryTag.forEach((tag) => {
				tagArr.push(Object.values(tag)[0]);
			});
			blogData.categoryTag = tagArr;
		} else blogData.categoryTag = ["Other"];
		let browser = {};
		try {
			if (authorInfo.customClaims.role != "Thành viên") {
				browser.displayName = authorInfo.displayName;
			} else browser = await admin.auth().getUser(blogData.browserID);
		} catch (e) {
			browser = "Chưa duyệt";
		}
		res.render("blog", {
			Auth: isAuth != undefined,
			blog: blogData,
			author: authorInfo,
			browser: browser.displayName,
		});
	},
	blogAction: async (req, res) => {
		const action = req.params.action;
		const blogId = req.body.blogId;
		const session = req.cookies.session;
		try {
			const userInfo = await authModelFn.isAuth(session);
			const userRef = firestore.collection("user").doc(userInfo.uid);
			const blogRef = firestore.collection("post-data").doc(blogId);
			const userDb = await userRef.get();
			let data = userDb.data();
			if (action == "like") {
				if (!data.likedPost.includes(blogId))
					data.likedPost.push(blogId);
				if (data.dislikedPost.includes(blogId))
					data.dislikedPost.splice(
						data.dislikedPost.indexOf(blogId, 1)
					);
				await blogRef.update({
					likeCount: FieldValue.increment(1),
				});
				await userRef.update({
					likedPost: data.likedPost,
					dislikedPost: data.dislikedPost,
				});
			}
			if (action == "unlike") {
				data.likedPost.splice(data.likedPost.indexOf(blogId), 1);
				await blogRef.update({
					likeCount: FieldValue.increment(-1),
				});
				await userRef.update({
					likedPost: data.likedPost,
				});
			}
			if (action == "dislike") {
				if (data.likedPost.includes(blogId))
					data.likedPost.splice(data.likedPost.indexOf(blogId, 1));
				if (!data.dislikedPost.includes(blogId))
					data.dislikedPost.push(blogId);
				await blogRef.update({
					dislikeCount: FieldValue.increment(1),
				});
				await userRef.update({
					dislikedPost: data.dislikedPost,
					likedPost: data.likedPost,
				});
			}
			if (action == "undislike") {
				data.dislikedPost.splice(data.dislikedPost.indexOf(blogId), 1);
				await blogRef.update({
					dislikeCount: FieldValue.increment(-1),
				});
				await userRef.update({
					dislikedPost: data.dislikedPost,
				});
			}
			res.json(200);
		} catch (e) {
			console.log(e);
			res.sendStatus(500);
		}
	},
	recommender: async (req, res) => {
		const session = req.cookies.session || "";
		let blogData = await firestore.collection("post-data").get();
		const isAuth = await authModelFn.isAuth(session);

		const tagData = (
			await firestore.collection("web-data").doc("detail").get()
		).data().currentTag;
		let tagArr = [];
		tagData.forEach((tag) => {
			for (key in tag) {
				tagArr.push({ key: key, value: tag[key] });
			}
		});
		const userData = (
			await firestore.collection("user").doc(isAuth.uid).get()
		).data();
		let user = await firestore.collection("user").get();
		let blogArr = [];
		let userArr = [];
		blogData.forEach((blog) => {
			blogArr.push(blog.data());
		});
		let i = 0;
		user.forEach((elm) => {
			userArr.push(elm.data());
			if (elm.id == isAuth.uid && _.isEqual(userData, elm.data())) {
				index = i;
			}
			i += 1;
		});
		const matrix = createMatrix(userArr, blogArr);
		const idxRecomPost = recommendPost(matrix, blogArr, index);
		idxRecomPost.forEach((blog) => {
			let blogTag = [];
			blog.categoryTag.forEach((tag) => {
				blogTag.push(Object.keys(tag));
			});
			blog.categoryTag = blogTag;
		});
		console.log(idxRecomPost[0].categoryTag);
		res.render("category", {
			Auth: true,
			blog: idxRecomPost,
			tagArr: tagArr,
			categoryTags: "Goi-y-cho-ban",
		});
	},
	postComment: async (req, res) => {
		try {
			const session = req.cookies.session;
			const userInfo = await authModelFn.isAuth(session);
			let comment = { ...req.body.data };
			comment.uid = userInfo.uid;
			comment.writeTime = new Date();
			await userModelFn.writeComment(comment, comment.blogId);
			res.sendStatus(200);
		} catch (e) {
			console.log(e);
			res.sendStatus(503);
		}
	},
	searchBlog: async (req, res) => {
		const search = { ...req.query };
		const SEARCH_LENGTH = search.search.length;
		const LIKELY_PERCENT = (65 / 100) * SEARCH_LENGTH;
		try {
			function lcs(a, b) {
				const matrix = Array(a.length + 1)
					.fill()
					.map(() => Array(b.length + 1).fill(0));
				for (let i = 1; i < a.length + 1; i++) {
					for (let j = 1; j < b.length + 1; j++) {
						if (a[i - 1] === b[j - 1]) {
							matrix[i][j] = 1 + matrix[i - 1][j - 1];
						} else {
							matrix[i][j] = Math.max(
								matrix[i - 1][j],
								matrix[i][j - 1]
							);
						}
					}
				}
				return matrix[a.length][b.length];
			}
			const snapshot = await firestore.collection("post-data").get();
			let data = [];
			snapshot.forEach(async (doc) => {
				const blogData = { ...doc.data() };
				const likeTitle = lcs(
					chuanHoa(search.search),
					chuanHoa(blogData.title)
				);
				if (
					likeTitle >= LIKELY_PERCENT ||
					chuanHoa(blogData.overview)
						.toLowerCase()
						.indexOf(chuanHoa(search.search).toLowerCase()) !==
						-1 ||
					chuanHoa(blogData.article)
						.toLowerCase()
						.indexOf(chuanHoa(search.search).toLowerCase()) !== -1
				) {
					blogData.likely = likeTitle;
					data.push(blogData);
				}
			});
			data.sort((a, b) => b.likely - a.likely);
			res.json(data);
		} catch (e) {
			console.log(e);
			res.sendStatus(500);
		}
	},
};
