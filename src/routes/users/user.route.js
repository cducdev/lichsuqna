const express = require("express");
const cookieParser = require("cookie-parser");
const route = express.Router();
const authController = require("../../controller/auth.controller");
const userController = require("../../controller/user.controller");
const bodyParser = require("body-parser");
const checkAuth = require("../../middleware/auth");

route.use(cookieParser());
route.use(bodyParser.urlencoded({ extended: true }));
route.use(bodyParser.json());

route.get("/", authController.index);
route.get("/register", authController.register);
route.get("/forgotpassword", authController.forgotPass);
route.get("/:userId/", checkAuth.isUserPage, authController.showProfile);
route.get("/:userId/:userPage/", checkAuth.isUserPage, (req, res) => {
	const page = req.params.userPage;
	if (page == "dashboard") userController.category(req, res);
	if (page == "manager-user") userController.managerUser(req, res);
	if (page == "blog-pending") userController.pendingBlog(req, res);
	if (page == "logout") authController.logOut(req, res);
});

route.post("/register", authController.signUp);

route.post("/delete/:userEmail", userController.deleteUser);

route.post("/edit-profile", userController.updateInfo);

route.post("/", authController.logIn);
route.post("/forgotpassword", authController.sendEmail);
module.exports = route;
