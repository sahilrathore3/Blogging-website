const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  // Kis blog par comment kiya gaya hai
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  
  // Comment kisne kiya
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Comment ka content
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // 🔄 REPLIES LOGIC: 
  // Agar ye comment kisi dusre comment ka reply hai, 
  // toh yahan parent comment ki ID aayegi.
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },

  // Ek comment ke andar bahut saare replies ho sakte hain
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],

  // Likes handle karne ke liye (Optional but good for UX)
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true });

// Indexing taaki search fast ho (Blog page load hote hi comments fetch karne ke liye)
commentSchema.index({ blogId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;