const firebaseApp = require("./firebase_connect");
const { getAuth } = require("firebase/auth");
const app = getAuth();
module.exports = app;
