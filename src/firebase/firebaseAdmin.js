const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("../../secretAccountKey.json");
const adminFire = initializeApp({
	credential: cert(serviceAccount),
	databaseURL: "YOUR_DATABASE_URL",
});

module.exports = adminFire;
