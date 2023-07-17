const firestore = require("../firebase/firestore");
module.exports = async (req, res, next) => {
	try {
		const blogId = decodeURI(req.params.blogId);
		let isHave = false;
		const ref = async () => await firestore.collection("pending").get();
		ref().then((snapshot) => {
			if (snapshot.empty) {
				res.send("Error");
			} else {
				snapshot.forEach((doc) => {
					let blogIdInDB = doc.id.split("?")[0];
					if (blogIdInDB == blogId) isHave = true;
				});
			}
			if (isHave) {
				next();
			} else res.status(404).send("The page not found");
		});
	} catch (error) {
		console.log(error);
		res.status(400).send("Invalid token");
	}
};
