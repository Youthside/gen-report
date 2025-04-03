import { Exam } from "@/models/Exam";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  exam: [] as Exam[],
};
export const dataSlice = createSlice({
  name: "exam",
  initialState: initialState,
  reducers: {
    // exam functions

    setExam: (state, action: PayloadAction<Exam[]>) => {
      state.exam = action.payload;
    },
    addExam: (state, action: PayloadAction<Exam>) => {
      state.exam.push(action.payload);
    },

    // end exam functions
  },
});

export const { addExam, setExam } = dataSlice.actions;
export default dataSlice.reducer;
