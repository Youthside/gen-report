import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./data";

const store = configureStore({
  reducer: {
    data: dataReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
