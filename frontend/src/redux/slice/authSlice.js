import { createSlice } from "@reduxjs/toolkit";
import { login, signup ,verifyOtpAndSignup} from "../thunk/authThunk";

const authSlice = createSlice({
    name: "auth",

    initialState: {
        user: null,
        token: null,
        loading: false,
        error: null,
    },

    reducers: {
        logout: (state) => {
            state.loading = false;
            state.user = null;
            state.token = null;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                const { user, token } = action.payload
                state.user = user;
                state.token = token;
            })

            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

          //   signup
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })

            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            //   verifyOtpAndSignup
            .addCase(verifyOtpAndSignup.pending, (state) => {
                state.loading = true;
                state.error= null;
            })
            .addCase(verifyOtpAndSignup.fulfilled, (state,action) => {
                state.loading = false; 
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(verifyOtpAndSignup.rejected, (state,action) => {
                state.loading = false; 
                state.error = action.payload;
            });
    }

});

export const { logout } = authSlice.actions;

export default authSlice.reducer;





    
