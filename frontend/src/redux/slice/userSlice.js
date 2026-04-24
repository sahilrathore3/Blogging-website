import { createSlice } from "@reduxjs/toolkit";
import { fetchMyProfile, changePasswordAction, updateUserProfile } from "../thunk/userThunk";


const userSlice = createSlice({
    name: 'user',
    initialState: {
        profile: null, // Yahan detailed profile data rahega
        loading: false,
        error: null,
        message: null // Password update ke success messages ke liye
    },
    reducers: {
        clearUserMessage: (state) => {
            state.message = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Profile
            .addCase(fetchMyProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload.data;
            })
            .addCase(fetchMyProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            //  change password
            .addCase(changePasswordAction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePasswordAction.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
            })
            .addCase(changePasswordAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; 
            });



    }
});

export const { clearUserMessage } = userSlice.actions;
export default userSlice.reducer;