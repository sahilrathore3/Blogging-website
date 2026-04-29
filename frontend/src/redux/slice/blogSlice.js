import { createSlice } from "@reduxjs/toolkit";
import { createBlog, fetchRecentBlogs, fetchBlogById, fetchBlogBySlug, fetchMyBlogs, deleteBlog, updateBlog } from "../thunk/blogThunk";

const blogSlice = createSlice({
    name: "blog",
    initialState: {
        blogs: [],        // Recent blogs for Home
        myBlogs: [],      // User blogs for Profile
        singleBlog: null,  // Detailed view blog ke liye 
        isFullContent: false,  //  Paywall flag
        loading: false,
        error: null,
        createSuccess: false,
        updateSuccess: false,
        deleteSuccess: false,
        pagination: {
            totalBlogs: 0,
            totalPages: 0,
            currentPage: 1,
            count: 0
        },
    },
    reducers: {
        // Status clear karne ke liye (taaki toast/alerts baar baar na dikhein)
        clearBlogStatus: (state) => {
            state.singleBlog = null;
            state.createSuccess = false;
            state.updateSuccess = false;
            state.deleteSuccess = false;
            state.error = null;
            state.loading = false
        }
    },
    extraReducers: (builder) => {
        builder
            //   create blog 
            .addCase(createBlog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBlog.fulfilled, (state, action) => {
                state.loading = false,
                    state.createSuccess = true,
                    state.blogs.unshift(action.payload.data);
            })
            .addCase(createBlog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // Fetch Recent Blogs (Home)
            .addCase(fetchRecentBlogs.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRecentBlogs.fulfilled, (state, action) => {
                state.loading = false;
                //   Backend se 'data' (array) aur pagination info dono save kar rhe hain
                state.blogs = action.payload.data;
                state.pagination = {
                    totalBlogs: action.payload.totalBlogs,
                    totalPages: action.payload.totalPages,
                    currentPage: action.payload.currentPage,
                    count: action.payload.count
                };
            })
            .addCase(fetchRecentBlogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // FETCH SINGLE BLOG BY ID (Home,allblog)
            .addCase(fetchBlogById.pending, (state) => {
                state.loading = true;
                state.singleBlog = null; // Purana data saaf kar do
                state.error = null;
            })
            .addCase(fetchBlogById.fulfilled, (state, action) => {
                state.loading = false;
                state.singleBlog = action.payload.data; // Backend ka 'data'
                state.isFullContent = action.payload.isFullContent; // Backend ka paywall flag
            })
            .addCase(fetchBlogById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            
            // FETCH SINGLE BLOG BY Slug
            .addCase(fetchBlogBySlug.pending, (state) => {
                state.loading = true;
                state.singleBlog = null; // Purana data saaf kar do
                state.error = null;
            })
            .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.singleBlog = action.payload.data; // Backend response ke hisab se
                state.isFullContent = action.payload.isFullContent;
            })
            .addCase(fetchBlogBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // Fetch My Blogs (Profile)
            .addCase(fetchMyBlogs.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyBlogs.fulfilled, (state, action) => {
                state.loading = false;
                const extractedArray = action.payload?.data?.blogs || [];
                state.myBlogs = extractedArray; // Ab ye hamesha ek ARRAY rahega
                // console.log("Slice Fixed: Array loaded with length:", extractedArray.length);
            })


            // --- DELETE BLOG ---
            .addCase(deleteBlog.fulfilled, (state, action) => {
                // UI se turant hatane ke liye filter use karenge
                state.blogs = state.blogs.filter(b => b._id !== action.payload.id);
                state.myBlogs = state.myBlogs.filter(b => b._id !== action.payload.id);
                state.deleteSuccess = true;
            })


            // --- UPDATE BLOG ---
            .addCase(updateBlog.fulfilled, (state, action) => {
                state.updateSuccess = true;
                // Array mein updated blog ko replace karna
                const index = state.myBlogs.findIndex(b => b._id === action.payload.data._id);
                if (index !== -1) {
                    state.myBlogs[index] = action.payload.data;
                }
            });
    }
});

export const { clearBlogStatus } = blogSlice.actions;
export default blogSlice.reducer;



