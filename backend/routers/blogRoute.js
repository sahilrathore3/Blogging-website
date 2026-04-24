const express = require('express');
const router = express.Router();
const blogController = require("../controllers/blogController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerConfig");


router.get("/", blogController.getAllBlogs);
router.get("/blog/:id", protect, blogController.getBlogById);

router.post("/create-blog", protect, upload.single('coverImage'), blogController.createBlog);
router.get("/my-blogs", protect, blogController.getMyBlogs);
router.put("/update-blog/:id", protect, upload.single('coverImage'), blogController.updateBlog);
router.delete("/delete-blog/:id", protect, blogController.deleteBlog);

module.exports = router;