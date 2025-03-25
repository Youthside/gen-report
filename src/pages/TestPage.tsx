import useQueryData from "@/hooks/use-query-data";

const queries = [
  "getFullDataCount",
  "getTodayDataCount",
  "getYesterdayDataCount",
  "getWeeklyAverageDataCount",
  "getLastWeekAverageDataCount",
  "getDailyDifference",
  "getWeeklyDifference"
];

const APIDataFetcher = () => {
  return (
    <div>
      <h2>API Verileri</h2>
      {queries.map((query) => {
        const { data, loading, error, refetch } = useQueryData<any>({
          endpoint: `/report.php?query=${query}`,
        });

        return (
          <div key={query} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
            <h3>{query}</h3>
            {loading && <p>Veri yükleniyor...</p>}
            {error && <p>Hata oluştu: {error}</p>}
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
            <button onClick={refetch}>Tekrar Getir</button>
          </div>
        );
      })}
    </div>
  );
};

export default APIDataFetcher;


