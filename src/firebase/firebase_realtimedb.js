const firebase = require("./firebase_connect");
const { getDatabase, set, ref } = require("firebase-admin/database");
const db = getDatabase();
module.exports = db;
