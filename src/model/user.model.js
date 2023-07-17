const authModelFn = require("./auth.model");
const firestore = require("../firebase/firestore");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue } = require("firebase-admin/firestore");
module.exports = {
	getUserInfo: async (idToken) => {
		try {
			const userAuth = await authModelFn.isAuth(idToken);
			const uid = userAuth.uid;
			const userInfo = await getAuth().getUser(uid);
			var user = {
				name: userInfo.displayName,
				role: userInfo.customClaims.role,
				avatar: userInfo.photoURL,
				uid: userInfo.uid,
				isAdmin: userInfo.customClaims.role === "Quản trị viên",
			};
			if (userInfo.customClaims.role === "Quản trị viên")
				user.role = "Quản trị viên";
			return user;
		} catch (e) {
			return {
				status: 401,
			};
		}
	},
	deleteUser: async (uid) => {
		return await getAuth().deleteUser(uid);
	},
	getPendingBlog: async (userCred) => {
		let blogData;
		if (userCred.role == "Thành viên") {
			blogData = await firestore
				.collection("pending")
				.where("authorUID", "==", userCred.uid)
				.get();
		} else blogData = await firestore.collection("pending").get();
		var listData = [];
		blogData.forEach((blog) => {
			const data = blog.data();
			data.isAdmin = userCred.role != "Thành viên";
			listData.push(data);
		});
		return listData;
	},
	getBlog: async (idToken, isBlogPage) => {
		var userInfo = undefined;
		if (isBlogPage !== true)
			userInfo = await module.exports.getUserInfo(idToken);
		if (userInfo != undefined) authorUID = userInfo.uid;
		if (isBlogPage === true || userInfo.role === "Quản trị viên")
			snapshot = await firestore.collection("post-data").get();
		else
			snapshot = await firestore
				.collection("post-data")
				.where("authorUID", "==", authorUID)
				.get();
		var userBlog = [];
		snapshot.forEach((doc) => {
			userBlog.push(doc.data());
		});
		userBlog.sort((a, b) => b.writeTime - a.writeTime);
		return userBlog;
	},
	updateUserInfo: async (uid, userInfo, updateInfo) => {
		try {
			var updateData = {
				uid: uid,
				email: userInfo.email,
				emailVerified: userInfo.emailVerified,
				displayName: userInfo.displayName,
				photoURL: userInfo.photoURL,
				phoneNumber: userInfo.phoneNumber,
				disabled: userInfo.disabled,
			};
			for (key in updateInfo) {
				if (key in userInfo && !!updateInfo[key]) {
					updateData[key] = updateInfo[key];
				}
			}
			await getAuth().updateUser(uid, updateData);
			return 200;
		} catch (e) {
			console.log(e);
			return e;
		}
	},
	getBlogData: async (blogId) => {
		const blogData = await firestore
			.collection("post-data")
			.doc(blogId)
			.get();
		return blogData;
	},
	deleteUserBlog: async (reqUID, reqRole, blogId, collection) => {
		const blogRef = firestore.collection(collection).doc(blogId);
		const blogData = await blogRef.get();
		const blogAuthorUID = blogData.data().authorUID;
		if (reqUID == blogAuthorUID || reqRole != "Thành viên") {
			blogRef.delete();
		} else {
			return false;
		}
	},
	browseBlog: async (blogId, browserUID) => {
		try {
			const blogRef = firestore.collection("pending").doc(blogId);
			let blogData = (await blogRef.get()).data();
			blogData.browserID = browserUID;
			await firestore.collection("post-data").doc(blogId).set(blogData, {
				merge: true,
			});
			await blogRef.delete();
		} catch (e) {
			console.log(e);
		}
	},
	getBlogWithFilter: async (filter) => {
		const snapshot = await firestore.collection("post-data").get();
		var blogData = [];
		snapshot.forEach((blog) => {
			const tagOfBlog = blog.data().categoryTag;
			for (tag in tagOfBlog) {
				if (filter == Object.keys(tagOfBlog[tag])) {
					blogData.push(blog.data());
					break;
				}
			}
		});
		return blogData;
	},
	writeComment: async (comment, blogId) => {
		const ref = firestore.collection("post-data").doc(blogId);
		let data = { ...comment };
		data.dislikeCount = 0;
		data.likeCount = 0;
		await ref.update({
			comments: FieldValue.arrayUnion(data),
		});
	},
};
