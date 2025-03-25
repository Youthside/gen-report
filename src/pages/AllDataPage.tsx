import { PremiumDataTable } from "@/components/premium-data-table";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

export default function AllDataPage() {
  const { allData } = useSelector((state: RootState) => state.data);
  return (
    <>
      <PremiumDataTable data={allData} />
    </>
  );
}
