import { createAsyncThunk } from "@reduxjs/toolkit";;
import API from "../../services/axios";

//  Post a Comment or Reply
export const postComment = createAsyncThunk(
    "comment/post",
    async (commentData, { rejectWithValue }) => {
        try {
            const res = await API.post("/comment/create-comment", commentData);
            return res.data; // Backend response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to post comment");
        }
    }
);

// Fetch Main Comments for a Blog
export const fetchBlogComments = createAsyncThunk(
    "comment/fetchByBlog",
    async (blogId, { rejectWithValue }) => {
        try {
            const res = await API.get(`/comment/blog-comment/${blogId}`)
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch comments");
        }
    }
);


//  Fetch Replies for a specific Comment
export const fetchCommentReplies = createAsyncThunk(
    "comment/fetchReplies",
    async (parentId, { rejectWithValue }) => {
        try {
            const res = await API.get(`/comment/comment-reply/${parentId}`);
            // Hum parentId bhi return kar rahe hain taaki slice mein asani ho
            return { parentId, replies: res.data.replies }; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch replies");
        }
    }
);