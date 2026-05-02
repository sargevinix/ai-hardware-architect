import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

var COLORS = ["#6366f1","#00ff88","#ff6b6b","#fbbf24","#a78bfa","#ff9a3c","#ff6eb4","#7eb8ff"];

function CostChart({ components, totalCost, budget }) {
  var data = components.map(function(c, i) {
    return { name: c.name, value: c.estimated_price_usd, index: i };
  });

  var CustomTooltip = function({ active, payload }) {
    if (active && payload && payload.length) {
      var item = payload[0];
      return (
        <div style={styles.tooltip}>
          <div style={styles.tooltipName}>{item.name}</div>
          <div style={styles.tooltipVal}>${item.value}</div>
          <div style={styles.tooltipPct}>{Math.round((item.value / totalCost) * 100)}% of total</div>
        </div>
      );
    }
    return null;
  };

  var remaining = budget - totalCost;

  return (
    <div className="card" style={{ gridColumn: "1 / -1" }}>
      <div className="card-header">
        <span className="card-title">Budget Breakdown</span>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>
          ${totalCost} of ${budget} used
        </span>
      </div>
      <div className="card-body">
        <div style={styles.layout}>
          <div style={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map(function(entry, i) {
                    return <Cell key={i} fill={COLORS[i % COLORS.length]} />;
                  })}
                </Pie>
                <Tooltip content={CustomTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.centerLabel}>
              <div style={styles.centerCost}>${totalCost}</div>
              <div style={styles.centerSub}>total</div>
            </div>
          </div>

          <div style={styles.legend}>
            {data.map(function(item, i) {
              var pct = Math.round((item.value / totalCost) * 100);
              return (
                <div key={i} style={styles.legendRow}>
                  <div style={styles.legendLeft}>
                    <div style={Object.assign({}, styles.dot, { background: COLORS[i % COLORS.length] })} />
                    <span style={styles.legendName}>{item.name}</span>
                  </div>
                  <div style={styles.legendRight}>
                    <span style={styles.legendPct}>{pct}%</span>
                    <span style={styles.legendVal}>${item.value}</span>
                  </div>
                </div>
              );
            })}
            <div style={styles.divider} />
            <div style={styles.legendRow}>
              <div style={styles.legendLeft}>
                <div style={Object.assign({}, styles.dot, { background: remaining >= 0 ? "#00ff88" : "#ff4444" })} />
                <span style={Object.assign({}, styles.legendName, { color: "var(--text-2)" })}>Remaining</span>
              </div>
              <div style={styles.legendRight}>
                <span style={{ fontSize: 12, fontWeight: 700, color: remaining >= 0 ? "#00ff88" : "#ff4444" }}>
                  {remaining >= 0 ? "+" : ""}{remaining}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

var styles = {
  layout: { display: "flex", gap: 24, alignItems: "center" },
  chartWrap: { position: "relative", width: 180, flexShrink: 0 },
  centerLabel: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center", pointerEvents: "none",
  },
  centerCost: { fontSize: 16, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px" },
  centerSub: { fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.5px" },
  legend: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  legendRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  legendLeft: { display: "flex", alignItems: "center", gap: 8 },
  legendRight: { display: "flex", alignItems: "center", gap: 12 },
  dot: { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  legendName: { fontSize: 12, color: "var(--text-2)", fontWeight: 500 },
  legendPct: { fontSize: 11, color: "var(--text-3)", width: 30, textAlign: "right" },
  legendVal: { fontSize: 12, fontWeight: 700, color: "var(--text-1)", width: 40, textAlign: "right", fontVariantNumeric: "tabular-nums" },
  divider: { height: 1, background: "var(--border)", margin: "4px 0" },
  tooltip: {
    background: "var(--bg-2)", border: "1px solid var(--border-bright)",
    borderRadius: 8, padding: "8px 12px",
  },
  tooltipName: { fontSize: 12, fontWeight: 600, color: "var(--text-1)", marginBottom: 2 },
  tooltipVal: { fontSize: 14, fontWeight: 800, color: "#6366f1" },
  tooltipPct: { fontSize: 11, color: "var(--text-3)" },
};

export default CostChart;