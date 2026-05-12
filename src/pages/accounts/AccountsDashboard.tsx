import { Card } from "@/components/ui/card";
import { useAccountsDashboard } from "@/hooks/useAccountsDashboard";
import { TrendingUp, TrendingDown, AlertCircle, Wallet, DollarSign, Briefcase } from "lucide-react";

const fmt = (n: number) => `GHS ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function AccountsDashboard() {
  const { data, isLoading } = useAccountsDashboard();
  const d = data ?? { revenue: 0, expenses: 0, outstanding: 0, cashBalance: 0, profit: 0, topJobs: [] as { id: string; profit: number }[] };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard title="Total Revenue" value={fmt(d.revenue)} icon={<TrendingUp className="h-5 w-5 text-success" />} loading={isLoading} />
        <MetricCard title="Total Expenses" value={fmt(d.expenses)} icon={<TrendingDown className="h-5 w-5 text-destructive" />} loading={isLoading} />
        <MetricCard title="Outstanding Invoices" value={fmt(d.outstanding)} icon={<AlertCircle className="h-5 w-5 text-warning" />} loading={isLoading} />
        <MetricCard title="Cash Balance" value={fmt(d.cashBalance)} icon={<Wallet className="h-5 w-5 text-primary" />} loading={isLoading} />
        <MetricCard title="Net Profit" value={fmt(d.profit)} icon={<DollarSign className="h-5 w-5 text-success" />} loading={isLoading} />
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Profit per Consignment (Top 10)</h3>
        </div>
        {d.topJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No posted vouchers linked to consignments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2">Consignment</th>
                  <th className="py-2 text-right">Profit (GHS)</th>
                </tr>
              </thead>
              <tbody>
                {d.topJobs.map((j) => (
                  <tr key={j.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{j.id.slice(0, 8)}</td>
                    <td className={`py-2 text-right font-semibold ${j.profit >= 0 ? "text-success" : "text-destructive"}`}>{fmt(j.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon, loading }: { title: string; value: string; icon: React.ReactNode; loading?: boolean }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-bold mt-1">{loading ? "..." : value}</p>
        </div>
        {icon}
      </div>
    </Card>
  );
}
