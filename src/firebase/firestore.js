const firebase = require("./firebase_connect");
const authAd = require("./firebaseAdmin");
const {
	getFirestore,
	collection,
	doc,
	query,
} = require("firebase-admin/firestore");
const database = getFirestore();

module.exports = database;
