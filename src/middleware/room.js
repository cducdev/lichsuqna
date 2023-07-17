const db = require("../firebase/firebase_realtimedb");
module.exports = async (req, res, next) => {
	const roomId = req.params.roomId;
	const ref = db.ref("rooms/" + roomId);
	const snapshot = await ref.get();
	if (snapshot.exists()) next();
	else res.redirect("/game/");
};
