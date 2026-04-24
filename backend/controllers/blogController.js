const Blog = require("../models/blogModel");
const fs = require("fs");
const path = require("path");


// CREATE BLOG ---
exports.createBlog = async (req, res) => {
    try {
        const { title, content, type, category, tags, status } = req.body;

        const coverImage = req.file
            ? `/uploads/blogs/${req.file.filename}`
            : "/uploads/blogs/default-cover.jpg";

        const newBlog = await Blog.create({
            title,
            content,
            type,
            category,
            tags: tags ? JSON.parse(tags) : [], // Tags array ko handle karne ke liye
            status,
            coverImage,
            authorId: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: "Blog created!",
            data: newBlog
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


//  GET ALL BLOGS ---
// exports.getAllBlogs = async (req, res) => {
//     try {
//         const blogs = await Blog.find().populate("authorId", "username profilePic").sort({ viewsCount: -1, createdAt: -1 }).limit(9);

//         return res.status(200).json({
//             success: true,
//             count: blogs.length,
//             data: blogs
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

exports.getAllBlogs = async (req, res) => {
    try {
        // 1. Query Params se values nikalna
        const page = parseInt(req.query.page) || 1; // Default Page 1
        const limit = parseInt(req.query.limit) || 10; // Default Limit 10 (Home Page ke liye)
        
        // 2. Skip Calculation (Pagination ka formula)
        // Agar Page 2 hai aur Limit 18, toh (2-1) * 18 = 18 blogs skip honge
        const skip = (page - 1) * limit;

        // 3. Security Check: Max limit 20 rakhte hain
        const safeLimit = limit > 20 ? 20 : limit;

        const sortField = req.query.sort === 'views' ? { viewsCount: -1 } : { createdAt: -1 }

        // 4. Optimized Query: Utne hi blogs fetch honge jitne chahiye
        const blogs = await Blog.find()
            .populate("authorId", "username profilePic")
            .sort( sortField ) // Sirf recent blogs ke liye
            .skip(skip)
            .limit(safeLimit);

        // 5. Total count (Frontend par pagination buttons dikhane ke liye)
        const totalBlogs = await Blog.countDocuments();

        return res.status(200).json({
            success: true,
            totalBlogs,
            totalPages: Math.ceil(totalBlogs / safeLimit),
            currentPage: page,
            count: blogs.length,
            data: blogs
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


//  GET SINGLE BLOG BY ID ---
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("authorId", "username profilePic");

        if (!blog) return res.status(404).json({
            success: false,
            data: null,
            message: "Blog not found"
        });

        // Check if user is logged in 
        if (req.user) {
            const userId = req.user._id;

            //  LOGIC: Check karo kya user ID pehle se list mein hai?
            const hasViewed = blog.viewedBy.includes(userId);

            if (!hasViewed) {
                // Agar pehli baar dekh raha hai:
                blog.viewsCount += 1;
                blog.viewedBy.push(userId); // List mein ID daal do
                await blog.save();
            }

            return res.status(200).json({
                success: true,
                data: blog,
                isFullContent: true
            });
        } else {
            // User login nahi hai: Sirf preview bhejo
            const previewData = {
                _id: blog._id,
                title: blog.title,
                coverImage: blog.coverImage,
                authorId: blog.authorId,
                category: blog.category,
                // Content ki sirf pehli 100 characters bhejein
                content: blog.content.substring(0, 150) + "...",
                createdAt: blog.createdAt
            };
            return res.status(200).json({
                success: true,
                data: previewData,
                isFullContent: false,
                message: "Please login to read the full story"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// GET LOGGED-IN USER BLOGS (For Profile Page);

exports.getMyBlogs = async (req, res) => {

    try {
        if (!req.user || !req.user._id) {
            console.log("Error: No User Found in Request");

            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                data: null
            });
        }

        // Search query ko variable mein lo taaki debug kar sakein
        const query = { authorId: req.user._id };
        // console.log("Executing Query:", query);

        const blogs = await Blog.find(query).populate("authorId", "username profilePic").sort("-createdAt");

        return res.status(200).json({
            success: true,
            count: blogs.length,
            data: { myBlogs: blogs }
        });
    } catch (error) {
        console.log("!!! ERROR IN GETMYBLOGS test!!!", error);

        return res.status(500).json({
            success: false,
            data: null,
            message: error.message
        });
    }
};

//  UPDATE BLOG ---
exports.updateBlog = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({
            success: false,
            data: null,
            message: "Blog not found"
        });

        // Authorization: Check karo ki kya ye usi user ka blog hai?
        if (blog.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access"
            });
        }

        // Agar nayi file upload hui hai
        if (req.file) {
            // Purani image delete karo agar default nahi hai toh
            if (blog.coverImage && !blog.coverImage.includes("default-cover.jpg")) {
                const oldPath = path.join(__dirname, "..", "..", blog.coverImage); // Adjust path based on your folder
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            req.body.coverImage = `/uploads/blogs/${req.file.filename}`;
        }

        if (req.body.tags) req.body.tags = JSON.parse(req.body.tags);

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            success: true,
            message: "Blog updated!",
            data: updatedBlog
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// --- 5. DELETE BLOG ---
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({
            success: false,
            message: "Blog not found"
        });

        // Security check
        if (blog.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        // Server se image file delete karo
        if (blog.coverImage && !blog.coverImage.includes("default-cover.jpg")) {
            const imagePath = path.join(__dirname, "..", blog.coverImage.startsWith('/') ? blog.coverImage.slice(1) : blog.coverImage);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await blog.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};