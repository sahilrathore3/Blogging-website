import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/axios";

export const login = createAsyncThunk(
    "auth/login",
    async (values, { rejectWithValue }) => {
        try {
            const res = await API.post("/auth/login", values);
            console.log(res);
            return res.data.data;

        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Login Failed")
        }
    }
)


export const signup = createAsyncThunk(
    "auth/signup",
    async (values, { rejectWithValue }) => {
        try {

            const res = await API.post("/auth/register", values);
            // console.log(res);
            return res.data;

        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Signup Failed")
        }
    }
)



export const verifyOtpAndSignup = createAsyncThunk(
    "auth/verifyOtpAndSignup",
    async (otpData, { rejectWithValue }) => {
        try {
            // otpData mein { email, otp } hona chahiye
            console.log("Sending to backend:", otpData);
            const res = await API.post("/auth/verifyandsignup", otpData);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Invalid OTP");
        }
    }
);


// Resend OTP 
export const resendVerificationOTP = createAsyncThunk(
    'auth/resendVerificationOTP',
    async (email, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/auth/resend-otp', { email });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

