import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/axios";

export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      // params mein { page, limit, search, gender } pass honge
      const response = await API.get("/admin/dashboard", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update user profile (Admin or Self)
export const profileUpdateByAdmin = createAsyncThunk(
  "admin/updateProfile",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/admin/update/${id}`, formData,{
        headers: {
                    'Content-Type': 'multipart/form-data', 
                },
      } );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

//  Delete user (Admin only)
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.delete(`/admin/delete-user/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);