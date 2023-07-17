const fs = require("fs");
const path = require("path");
const { MemoryStore, SymSpellEx } = require("symspell-ex");
const initialPath = `${__dirname}/../config/vn_words/Viet74k.txt`;
module.exports = {
	readDictionary: (dicPath) => {
		try {
			const data = fs.readFileSync(initialPath, "utf-8");
			let array = [];
			let word = "";
			for (let i = 0; i < data.length; i++) {
				if (data[i] === "\n") {
					array.push(word);
					word = "";
				} else word += data[i];
			}
			return array;
		} catch (e) {
			return e;
		}
	},
	correctWord: async (invalidWord, dictionary) => {
		const LANGUAGE = "en";
		let symSpellEx = new SymSpellEx(new MemoryStore());
		await symSpellEx.initialize();
		await symSpellEx.train(dictionary, 1, LANGUAGE);
		console.log(symSpellEx);
		const result = await symSpellEx.search("argoments", "en");
		return result;
	},
};
