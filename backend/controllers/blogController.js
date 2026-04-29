const Blog = require("../models/blogModel");
const fs = require("fs");
const path = require("path");


// CREATE BLOG ---

// exports.createBlog = async (req, res) => {
//     try {
//         const { title, content, type, category, tags, status,images } = req.body;

//         const coverImage = req.file
//             ? `/uploads/blogs/${req.file.filename}`
//             : "/uploads/blogs/default-cover.jpg";

//         const newBlog = await Blog.create({
//             title,
//             content,
//             type,
//             category,
//             tags: tags ? JSON.parse(tags) : [], // Tags array ko handle karne ke liye
//             status,
//             coverImage,
//             images,
//             authorId: req.user._id
//         });

//         return res.status(201).json({
//             success: true,
//             message: "Blog created!",
//             data: newBlog
//         });
//     } catch (error) {
//         return res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

exports.createBlog = async (req, res) => {
    try {
        const { title, content, type, category, tags, status } = req.body;

        // 1. Handle Main Cover Image
        let coverImage = "/uploads/blogs/default-cover.jpg";
        if (req.files && req.files.coverImage) {
            coverImage = `/uploads/blogs/${req.files.coverImage[0].filename}`;
        }

        // 2. Handle Gallery Images (Optional)
        let galleryImages = [];
        if (req.files && req.files.images) {
            galleryImages = req.files.images.map(file => `/uploads/blogs/${file.filename}`);
        }

        // 3. Handle Tags (Frontend se tags[] array ya string aa sakta hai)
        let processedTags = [];
        if (tags) {
            try {
                processedTags = JSON.parse(tags);
            } catch (e) {
                processedTags = tags.split(',').map(t => t.trim());
            }
        }

        const newBlog = await Blog.create({
            title,
            content,
            type,
            category,
            tags: processedTags,
            status,
            coverImage,
            images: galleryImages,
            authorId: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: "Blog created successfully!",
            data: newBlog
        });
    } catch (error) {
        console.error("Create Blog Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


//  GET ALL BLOGS ---

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
            .sort(sortField) // Sirf recent blogs ke liye
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


exports.getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const blog = await Blog.findOne({ slug: slug }).populate("authorId", "username profilePic");

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



// GET Specific USER BLOGS (For Profile Page  and Admin dashboard);


exports.getUserBlogs = async (req, res) => {
    try {
        // 1. Check karo ki kya URL mein userId aayi hai (Admin view ke liye)
        const { userId } = req.query; // query se uthayenge ya params se

        let targetId;

        if (userId && req.user.role === 'admin') {
            // Agar Admin kisi ki profile dekh raha hai
            targetId = userId;
        } else {
            // Normal case: Login user apne blogs dekh raha hai
            targetId = req.user._id;
        }

        if (!targetId) {
            return res.status(400).json({
                success: false,
                message: "Target User ID not found"
            });
        }

        // 2. Query execute karo (Aapka query variable logic perfect tha)
        const blogs = await Blog.find({ authorId: targetId })
            .populate("authorId", "username profilePic")
            .sort("-createdAt");

        return res.status(200).json({
            success: true,
            count: blogs.length,
            // Consistency ke liye 'blogs' key hi rakho taaki frontend handle karna aasaan ho
            data: { blogs: blogs }
        });

    } catch (error) {
        console.log("!!! ERROR IN GET_USER_BLOGS !!!", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//  UPDATE BLOG ---
exports.updateBlog = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        const updateData = { ...req.body };

        // 1. Cover Image handle
        if (req.files && req.files.coverImage) {
            updateData.coverImage = `/uploads/blogs/${req.files.coverImage[0].filename}`;
            // Purani file delete karne ka logic yahan sahi hai...
        } else {
            // Agar nayi file nahi hai, toh purani hi rehne do
            delete updateData.coverImage; 
        }

        // 2. Gallery Merge Logic (SABSE IMPORTANT)
        let finalGallery = [];

        // Jo purani images bachi hui hain (Frontend se aayi hain)
        if (req.body.existingImages) {
            finalGallery = JSON.parse(req.body.existingImages);
        }

        // Jo nayi images upload hui hain
        if (req.files && req.files.images) {
            const newImagePaths = req.files.images.map(file => `/uploads/blogs/${file.filename}`);
            finalGallery = [...finalGallery, ...newImagePaths];
        }

        // Ab database mein wahi gallery jayegi jo user ne screen par chhodi hai
        updateData.images = finalGallery;

        // 3. Tags parsing
        if (req.body.tags) {
            updateData.tags = JSON.parse(req.body.tags);
        }

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.status(200).json({ success: true, message: "Blog Updated!", data: updatedBlog });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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