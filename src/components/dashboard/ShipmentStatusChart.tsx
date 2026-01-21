import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "In Transit", value: 45, color: "hsl(199, 89%, 48%)" },
  { name: "At Port", value: 28, color: "hsl(38, 92%, 50%)" },
  { name: "Customs", value: 18, color: "hsl(280, 65%, 60%)" },
  { name: "Delivered", value: 72, color: "hsl(152, 69%, 40%)" },
  { name: "Pending", value: 12, color: "hsl(220, 9%, 46%)" },
];

export function ShipmentStatusChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Shipment Status Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                boxShadow: "var(--shadow-md)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <p className="text-3xl font-bold text-foreground">175</p>
        <p className="text-sm text-muted-foreground">Total Active Shipments</p>
      </div>
    </div>
  );
}
