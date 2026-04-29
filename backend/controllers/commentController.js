const Comment = require("../models/commentModel");
const Blog = require("../models/blogModel");

// Ceate comments

exports.createComment = async (req, res) => {
    console.log(req.body)
    try {
        const { blogId, content, parentId } = req.body;
        const authorId = req.user._id;

        //  Naya comment create karein
        const newComment = new Comment({
            blogId,
            authorId,
            content,
            parentId: parentId || null
        });

        const savedComment = await newComment.save();

        //  Agar ye ek "Reply" hai (yani parentId exist karta hai)
        if (parentId) {
            await Comment.findByIdAndUpdate(parentId, {
                $push: { replies: savedComment._id }
            });
        }

        // Author details ke saath return karein taaki frontend pe turant dikhe
        const fullComment = await Comment.findById(savedComment._id).populate('authorId', 'username profilePic');

        return res.status(201).json({
            success: true,
            message: parentId ? "Reply added" : "comment added",
            data: fullComment
        });

    } catch (error) {
        console.log("commentError:" ,error)
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        })
    }
}



//  Get main comments

exports.getBlogComments = async (req, res) => {
    try {
        const { blogId } = req.params;

        const comments = await Comment.find({ blogId, parentId: null })
            .populate('authorId', 'username profilePic')
            .sort({ createdAt: -1 }); // Latest comments first

        return res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};


// Get Replies (Specific Comment ke niche)

exports.getCommentReplies = async (req, res) => {
    try {
        const { parentId } = req.params;

        const replies = await Comment.find({ parentId })
            .populate('authorId', 'username profilePic')
            .sort({ createdAt: 1 }); // Replies purane se naye ki taraf (Ascending)

        return res.status(200).json({
            success: true,
            replies
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};