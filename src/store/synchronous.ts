import { LastSyncData } from "@/hooks/use-data-manager";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  lastSyncTime: null as LastSyncData | null,
  syncStatus: "idle" as "idle" | "syncing" | "success" | "error",
  showSuccessAnimation: false,
};
export const synchronousSlice = createSlice({
  name: "data",
  initialState: initialState,
  reducers: {
    setLastSyncTime: (state, action: PayloadAction<LastSyncData | null>) => {
      state.lastSyncTime = action.payload;
    },
    setSyncStatus: (
      state,
      action: PayloadAction<"idle" | "syncing" | "success" | "error">
    ) => {
      state.syncStatus = action.payload;
    },
    setShowSuccessAnimation: (state, action: PayloadAction<boolean>) => {
      state.showSuccessAnimation = action.payload;
    },
  },
});

export const { setLastSyncTime, setShowSuccessAnimation, setSyncStatus } =
  synchronousSlice.actions;
export default synchronousSlice.reducer;
