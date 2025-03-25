import SubmissionData from "@/components/premium-data-table";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  allData: [] as SubmissionData[],
};
export const dataSlice = createSlice({
  name: "data",
  initialState: initialState,
  reducers: {
    // allData functions

    setAllData: (state, action: PayloadAction<SubmissionData[]>) => {
      state.allData = action.payload;
    },
    addAllData: (state, action: PayloadAction<SubmissionData>) => {
      state.allData.push(action.payload);
    },

    // end allData functions
  },
});

export const { addAllData, setAllData } = dataSlice.actions;
export default dataSlice.reducer;
