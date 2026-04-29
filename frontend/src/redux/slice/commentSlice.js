import { createSlice } from "@reduxjs/toolkit";
import { postComment, fetchBlogComments, fetchCommentReplies } from "../thunk/commentThunk";

const commentSlice = createSlice({
    name: "comment",
    initialState : {
        comments: [],       // Main comments ki list
        replies: {},        // Comment ID as key aur unke replies as value
        loading: false,
        error: null,
        success: false,
    },

    reducers: {
        clearCommentStatus: (state) => {
            state.success = false;
            state.error = null;
            state.loading = false;
        },
    },

    extraReducers: (builder) => {
        builder
            //   Post Comment / Reply ---
            .addCase(postComment.pending, (state) => {
                state.loading = true;
            })
            .addCase(postComment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;

                const newComment = action.payload.data;

                // Agar ye main comment hai (no parentId), toh list mein upar add karo
                if (!newComment.parentId) {
                    state.comments.unshift(newComment);
                } else {
                    // Agar reply hai, toh use uske parent ke replies list mein turant add kar sakte hain
                    const pId = newComment.parentId;
                    if (state.replies[pId]) {
                        state.replies[pId].push(newComment);
                    } else {
                        state.replies[pId] = [newComment];
                    }
                }
            })

            .addCase(postComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Blog Comments ---
            .addCase(fetchBlogComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload.data;
            })
            .addCase(fetchBlogComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch comment Replies ---
            .addCase(fetchCommentReplies.fulfilled, (state, action) => {
                const { parentId, replies } = action.payload;
                // Object mein parentId ke against replies save kar rahe hain
                state.replies[parentId] = replies;
            });
    },

});

export const { clearCommentStatus } = commentSlice.actions;
export default commentSlice.reducer;