import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/axios";

//  create blog (user Profile)
export const createBlog = createAsyncThunk(
    "blog/create",

    async (formData, { rejectWithValue }) => {
        try {
            const res = await API.post("/blog/create-blog", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Blog Creation Failed");
        }
    }
);


//  Fetch Recent 10 Blogs and All blogs (Home Page and AllBlogs.jsx)
export const fetchRecentBlogs = createAsyncThunk(
    "blog/fetchRecent",
    async ({ page = 1, limit = 10, sort = " " }, { rejectWithValue }) => {
        try {
            const res = await API.get(`http://localhost:3000/api/blog?page=${page}&limit=${limit}&sort=${sort}`);
            // console.log("Backend Response:", res.data);
            // Backend sorted data bhej raha hai, hum bas top 10 slice kar lenge
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch blogs");
        }
    }
);


//  Fetch Single User Specific Blogs by id (Blog Details page)
export const fetchBlogById = createAsyncThunk(
    "blog/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await API.get(`/blog/blog/${id}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(error.response?.data?.message || "Blog not found");
        }
    }
);

//  Fetch Single User Specific Blogs by slug (Blog Details page)
export const fetchBlogBySlug = createAsyncThunk(
    "blog/fetchBlogBySlug",
    async (slug, { rejectWithValue }) => {
        try {
            const res = await API.get(`/blog/slug/${slug}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Blog not found");
        }
    }
);


// FETCH LOGGED-IN USER BLOGS (Profile Page)
export const fetchMyBlogs = createAsyncThunk(
    "blog/fetchMyBlogs",
  async (userId = null, { rejectWithValue }) => {
        try {
            // Agar userId hai toh query string bhejenge, warna khali (for own blogs)
            const url = userId ? `/blog/my-blogs?userId=${userId}` : "/blog/my-blogs";
            
            const res = await API.get(url);
            
            // Note: Aapka backend data 'data.blogs' mein bhej raha hai
            return res.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch blogs");
        }
    }
);


//  DELETE BLOG
export const deleteBlog = createAsyncThunk(
    "blog/delete",
    async (id, { rejectWithValue }) => {
        try {
            const res = await API.delete(`/blog/delete-blog/${id}`);
            return { id, message: res.data.message }; // ID return kar rahe hain taaki slice se remove kar sakein
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Delete Failed");
        }
    }
);

// UPDATE BLOG
export const updateBlog = createAsyncThunk(
    "blog/update",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const res = await API.put(`/blog/update-blog/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Update Failed");
        }
    }
);