const recommend = require("collaborative-filter");
const firestore = require("../firebase/firestore");

module.exports = {
	createMatrix: (userList, itemList) => {
		let matrix = [];
		userList.forEach((user) => {
			let userArr = [];
			itemList.forEach((post) => {
				if (user.likedPost.includes(post.id)) {
					userArr.push(1);
				} else {
					userArr.push(0);
				}
			});
			matrix.push(userArr);
		});
		return matrix;
	},
	recommendPost: (matrix, itemList, userIndex) => {
		const result = recommend.cFilter(matrix, userIndex);
		let final = [];
		result.forEach((idx) => {
			final.push(itemList[idx]);
		});
		return final;
	},
};
