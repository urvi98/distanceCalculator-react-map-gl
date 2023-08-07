// reducers.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  points: [],
};

const mapReducer = createSlice({
  name: "map",
  initialState,
  reducers: {
    addPoint: (state, action) => {
      state.points.push(action.payload);
    },
    resetPoints: (state) => {
      state.points = [];
    },
  },
});

export const { addPoint, resetPoints } = mapReducer.actions;
export default mapReducer.reducer;
