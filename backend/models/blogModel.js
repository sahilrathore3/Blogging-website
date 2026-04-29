const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A blog must have a title"],
    trim: true,
  },
  content: {
    type: String,
    required: [true, "Content cannot be empty"],
  },
  type: {
    type: String,
    enum: ["text", "video", "audio", "image-gallery"],
    default: "text",
  },
  coverImage: {
    type: String,
    default: "default-cover.jpg",
  },
  images: [String],

  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A blog must belong to an author"],
  },
  slug: {
    type: String,
    unique: true
  },
  tags: [String],
  category: {
    type: String,
    required: [true, "Please specify a category"],
    enum: [
      "Food", "Travel", "Health & Fitness", "Lifestyle",
      "Fashion & Beauty", "DIY Craft", "Parenting",
      "Business", "Personal Finance", "Sports", "Other"
    ],
  },
  status: {
    type: String,
    enum: ["draft", "published", "scheduled"],
    default: "draft",
  },

  publishedAt: Date,
  scheduledFor: Date,
  viewsCount: { type: Number, default: 1 },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

blogSchema.pre('validate', async function () {
  // Sirf tabhi slug generate karein jab title change ho ya naya blog ho
  if (this.isModified('title')) {
    const slugTitle = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Special chars hatao
      .replace(/[\s_-]+/g, '-')  // Spaces aur underscores ko dash banao
      .replace(/^-+|-+$/g, '');  // Start/End se dash hatao

    // ID ke last 10 digits (this._id hamesha available hota hai pre-save mein)
    const shortId = this._id.toString().slice(-10);

    this.slug = `${slugTitle}-${shortId}`;
  }
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;