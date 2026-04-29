const express = require('express');
const router = express.Router();
const blogController = require("../controllers/blogController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/isAdmin");
const upload = require("../middleware/multerConfig");


router.get("/", blogController.getAllBlogs);
router.get("/blog/:id", protect, blogController.getBlogById);
router.get("/slug/:slug", protect, blogController.getBlogBySlug);

// router.post("/create-blog", protect, upload.single('coverImage'), blogController.createBlog);
router.post("/create-blog", protect, upload.fields([{ name: 'coverImage', maxCount: 1 },{ name: 'images', maxCount: 10 }]), blogController.createBlog);
// router.get("/my-blogs", protect, blogController.getMyBlogs);
router.get("/my-blogs", protect, isAdmin, blogController.getUserBlogs);
router.put("/update-blog/:id", protect, upload.fields([{ name: 'coverImage', maxCount: 1 },{ name: 'images', maxCount: 10 }]), blogController.updateBlog);
router.delete("/delete-blog/:id", protect, blogController.deleteBlog);

module.exports = router; 