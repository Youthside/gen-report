import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  setLastSyncTime as setLastSyncTimeAction,
  setSyncStatus as setSyncStatusAction,
  setShowSuccessAnimation as setShowSuccessAnimationAction,
} from "@/store/synchronous";
import { LastSyncData } from "./use-data-manager";

export default function useSynchronousManager() {
  const dispatch = useDispatch();
  const { lastSyncTime, showSuccessAnimation, syncStatus } = useSelector(
    (state: RootState) => state.synchronous
  );

  const setLastSyncTime = (data: LastSyncData | null) => {
    dispatch(setLastSyncTimeAction(data));
  };

  const setSyncStatus = (status: "idle" | "syncing" | "success" | "error") => {
    dispatch(setSyncStatusAction(status));
  };

  const setShowSuccessAnimation = (value: boolean) => {
    dispatch(setShowSuccessAnimationAction(value));
  };

  return {
    lastSyncTime,
    syncStatus,
    showSuccessAnimation,
    setLastSyncTime,
    setSyncStatus,
    setShowSuccessAnimation,
  };
}
