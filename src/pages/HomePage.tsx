import { DashboardContent } from "@/components/dashboard-content";
import SummaryPage from "./SummaryPage";

export default function HomePage() {
  return (
    <div>
      <DashboardContent />
      <div className="mt-5 mb-5">
        <SummaryPage />
      </div>
    </div>
  );
}
