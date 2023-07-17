const { getAuth } = require("firebase-admin/auth");
const firestore = require("../firebase/firestore");
module.exports = {
	getAllUserInSystem: async (maxResults) => {
		const listUser = await getAuth().listUsers(maxResults);
		return listUser.users;
	},
	setPermissonForUser: async (email, role) => {
		const user = await getAuth().getUserByEmail(email);
		const uid = user.uid;
		await getAuth().setCustomUserClaims(uid, {
			role: role,
		});
	},
	getAllCurrentTag: async () => {
		const currentTag = await firestore
			.collection("web-data")
			.doc("detail")
			.get();
		return currentTag.data().currentTag;
	},
};
