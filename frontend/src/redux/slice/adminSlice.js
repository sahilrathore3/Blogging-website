import { createSlice } from "@reduxjs/toolkit";
import { fetchAllUsers , deleteUser, profileUpdateByAdmin } from "../thunk/adminThunk";

const adminSlice = createSlice({
  name: "admin",
  
  initialState: {
    users: [],
    loading: false,
    error: null,

    // pagination
     page: 1,
     limit: 5,
     total: 0,
     totalPages: 0,
  },

  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1; 
    },
  },


  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.currentPage; // Backend se synced page  
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload.id);
        state.total -= 1;
      })

      // Update User
      .addCase(profileUpdateByAdmin.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload.data.userId);
        if (index !== -1) {
          // Table data ko refresh karein naye details ke sath
          state.users[index] = { ...state.users[index], ...action.payload.data };
        }
      });
  },
});

export const { setPage, setLimit } = adminSlice.actions;
export default adminSlice.reducer;