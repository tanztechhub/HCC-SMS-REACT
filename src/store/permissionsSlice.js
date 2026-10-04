// src/store/permissionsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token;
};

export const fetchJuniorPermissions = createAsyncThunk(
  "permissions/fetchJuniorPermissions",
  async () => {
    const response = await fetch(`${API_URL}/admin-permissions`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch permissions");
    }
    return data.data.juniorAllowedTabs;
  }
);

export const updateJuniorPermissions = createAsyncThunk(
  "permissions/updateJuniorPermissions",
  async (juniorAllowedTabs) => {
    const response = await fetch(`${API_URL}/admin-permissions`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ juniorAllowedTabs }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update permissions");
    }
    return data.data.juniorAllowedTabs;
  }
);

const permissionsSlice = createSlice({
  name: "permissions",
  initialState: {
    juniorAllowedTabs: [],
    status: "idle", // idle | loading | succeeded | failed
    saving: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJuniorPermissions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchJuniorPermissions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.juniorAllowedTabs = action.payload;
      })
      .addCase(fetchJuniorPermissions.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(updateJuniorPermissions.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateJuniorPermissions.fulfilled, (state, action) => {
        state.saving = false;
        state.status = "succeeded";
        state.juniorAllowedTabs = action.payload;
      })
      .addCase(updateJuniorPermissions.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default permissionsSlice.reducer;
