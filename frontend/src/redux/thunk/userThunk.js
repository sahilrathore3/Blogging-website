import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/axios";

export const fetchMyProfile = createAsyncThunk(
    "users/fetchMyProfile",
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get("/user/profile");
            return response.data; // Isme user + userDetails merged data hoga
        } catch (err) {
            return rejectWithValue(err.response.data.message);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/user/update/${id}`, formData ,{
        headers: {
                    'Content-Type': 'multipart/form-data', 
                },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const changePasswordAction = createAsyncThunk(
    "user/changePassword",
    async (passwordData, { rejectWithValue }) => {

        try {
            // API call (Humein oldPassword aur newPassword bhejni hai)
            const response = await API.put("/auth/change-password", passwordData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Password update failed");
        }
    }
);

