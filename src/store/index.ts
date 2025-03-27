import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./data";
import synchronousReducer from "./synchronous";

const store = configureStore({
  reducer: {
    data: dataReducer,
    synchronous: synchronousReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
