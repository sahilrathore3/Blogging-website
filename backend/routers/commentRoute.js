const express = require('express');
const router = express.Router();
const commentController =  require('../controllers/commentController');
const {protect} = require("../middleware/authMiddleware");


router.post("/create-comment",protect,commentController.createComment);
router.get("/blog-comment/:blogId",protect,commentController.getBlogComments);
router.get("/comment-reply/:parentId",protect,commentController.getCommentReplies);


module.exports = router; 