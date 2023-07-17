const authModelFn = require("../model/auth.model");
const userModelFn = require("../model/user.model");
const adminModelFn = require("../model/admin.model");
const { getAuth } = require("firebase-admin/auth");
const firestore = require("../firebase/firestore");
module.exports = {
	category: async (req, res) => {
		const sessionToken = req.cookies.session || "";
		const userBlog = await userModelFn.getBlog(sessionToken, false);
		const userInfo = await userModelFn.getUserInfo(sessionToken);
		const data = await userModelFn.getPendingBlog(userInfo);
		userBlog.forEach((blog) => {
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
		res.render("dashboard", {
			Auth: true,
			dashboard: true,
			PageTitle: "Bài viết",
			blog: userBlog,
			user: userInfo,
			isNotMember: userInfo.role != "Thành viên",
			pendingLength: data.length,
			tagArr: tagArr,
		});
	},
	pendingBlog: async (req, res) => {
		const session = req.cookies.session;
		try {
			const userInfo = await userModelFn.getUserInfo(session);
			const data = await userModelFn.getPendingBlog(userInfo);
			res.render("dashboard", {
				Auth: true,
				pendingBlog: true,
				PageTitle: "Bài viết đang chờ duyệt",
				user: userInfo,
				isNotMember: userInfo.role != "Thành viên",
				blog: data,
				pendingLength: data.length,
			});
		} catch (e) {
			console.log(e);
			res.redirect("/user");
		}
	},
	managerUser: async (req, res) => {
		const idToken = req.cookies.session || "";
		const userInfo = await userModelFn.getUserInfo(idToken);
		const data = await userModelFn.getPendingBlog(userInfo);
		if (!userInfo.isAdmin) {
			res.status(401).send("You don't have enough permission");
		} else {
			const listUser = await adminModelFn.getAllUserInSystem(1000);
			res.render("dashboard", {
				Auth: true,
				managerUser: true,
				user: userInfo,
				isNotMember: userInfo.role != "Thành viên",
				userData: listUser,
				PageTitle: "Quản lý người dùng",
				pendingLength: data.length,
			});
		}
	},
	updateInfo: async (req, res) => {
		const editData = req.body;
		const idToken = req.cookies.session;
		if (editData.changeRole === true) {
			const userInfo = await userModelFn.getUserInfo(idToken);
			if (userInfo.role == "Quản trị viên") {
				await adminModelFn.setPermissonForUser(
					editData.email,
					editData.role
				);
				res.json({ redirect: "/user/" });
			} else {
				res.status(401);
			}
		} else
			try {
				const isAuth = await authModelFn.isAuth(idToken);
				const userInfo = await getAuth().getUser(isAuth.uid);
				await userModelFn.updateUserInfo(
					userInfo.uid,
					userInfo,
					editData
				);
				res.json({ redirect: "/user/" });
			} catch (e) {
				console.log(e);
				res.status(401);
			}
	},
	deleteUser: async (req, res) => {
		const idToken = req.cookies.session || "";
		const userDeletedEmail = req.body.email;
		try {
			const userInfo = await userModelFn.getUserInfo(idToken);
			if (userInfo.role === "Quản trị viên") {
				const userDeleted = await getAuth().getUserByEmail(
					userDeletedEmail
				);
				const userDeletedId = userDeleted.uid;
				await userModelFn.deleteUser(userDeletedId);
				await firestore.collection("user").doc(userDeletedId).delete();
				res.json({ redirect: "/user/" });
			} else {
				res.sendStatus(401);
			}
		} catch (e) {
			console.log(e);
			throw e;
		}
	},
};
