const express = require("express");
const route = express.Router();
const checkBlogExist = require("../middleware/blog");
const blogController = require("../controller/blog.controller");
const pendingBlog = require("../middleware/pendingblog");
const categoryPage = require("../middleware/categoryPage");
const middleware = require("../middleware/auth");

route.get("/", blogController.indexPage);
route.post("/", blogController.searchBlog);

route.get("/Goi-y-cho-ban", middleware.isAuth, blogController.recommender);
route.get("/:blogCategorytag/", categoryPage, blogController.categoryTagPage);
route.get(
	"/pending/:blogId",
	pendingBlog,
	middleware.isNotMember,
	blogController.readPendingBlog
);
route.post("/pending/:blogId/delete", pendingBlog, blogController.deleteBlog);
route.post("/:blogId/delete", checkBlogExist, blogController.deleteBlog);
route.post("/browse/:blogId", pendingBlog, blogController.browserBlog);

route.get(
	"/:blogCategorytag/:blogId",
	categoryPage,
	checkBlogExist,
	blogController.blogPage
);
route.post(
	"/:blogCategorytag/:blogId/post-comment/",
	categoryPage,
	checkBlogExist,
	middleware.isAuth,
	blogController.postComment
);
route.post(
	"/:blogCategorytag/:blogId/:action/",
	categoryPage,
	checkBlogExist,
	middleware.isAuth,
	blogController.blogAction
);

module.exports = route;
