const firestore = require("../firebase/firestore");
module.exports = async (req, res, next) => {
	try {
		const arr = (
			await firestore.collection("web-data").doc("detail").get()
		).data().currentTag;
		let flag = false;
		for (i in arr) {
			if (req.params.blogCategorytag == Object.keys(arr[i])[0])
				flag = true;
		}
		if (flag) next();
		else res.sendStatus(404);
	} catch (e) {
		console.log(e);
		res.sendStatus(404);
	}
};
