import Analytics from "@/components/analytics/Analytics";


export default function AnalyticsView() {
  return (
    <main className="container my-10 max-w-6xl space-y-10"> 
      <h2 className="text-2xl font-medium mb-2">Monitoring and Control</h2>
      <div><Analytics/></div>
    </main>
  );
}
