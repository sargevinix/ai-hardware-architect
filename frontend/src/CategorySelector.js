var CATEGORIES = [
  {
    id: "wearable",
    label: "Wearable",
    desc: "Glasses, rings, watches, health trackers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    constraints: "Must be lightweight under 50g, low power under 200mW, compact size",
  },
  {
    id: "iot",
    label: "IoT Sensor",
    desc: "Environmental, industrial, smart home",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <circle cx="12" cy="20" r="1" fill="currentColor"/>
      </svg>
    ),
    constraints: "Optimize for low power consumption and long battery life, WiFi or LoRa connectivity",
  },
  {
    id: "robotics",
    label: "Robotics",
    desc: "Motors, servos, autonomous systems",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="10" rx="2"/>
        <circle cx="12" cy="5" r="2"/>
        <path d="M12 7v4"/>
        <line x1="8" y1="16" x2="8" y2="16"/>
        <line x1="16" y1="16" x2="16" y2="16"/>
      </svg>
    ),
    constraints: "High torque motors, real-time control, robust power management for actuators",
  },
  {
    id: "audio",
    label: "Audio",
    desc: "Speakers, mics, synthesizers, amps",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    ),
    constraints: "Low noise amplification, high fidelity DAC/ADC, proper impedance matching",
  },
  {
    id: "drone",
    label: "Drone / UAV",
    desc: "Flight controllers, FPV, autonomous",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
        <path d="M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
        <path d="M18 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
        <path d="M6 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
        <path d="M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
        <path d="M7.5 7.5l3 3m3 3l3 3m0-6l-3 3m-3 3l-3 3"/>
      </svg>
    ),
    constraints: "Lightweight ESCs and motors, flight controller with IMU, LiPo battery management",
  },
  {
    id: "general",
    label: "General",
    desc: "No constraints, full flexibility",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    constraints: "",
  },
];

function CategorySelector({ selected, onSelect }) {
  return (
    <div style={styles.wrap}>
      {CATEGORIES.map(function(cat) {
        var isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={function() { onSelect(cat.id); }}
            style={Object.assign({}, styles.btn, isActive ? styles.btnActive : {})}
          >
            <div style={Object.assign({}, styles.icon, isActive ? styles.iconActive : {})}>
              {cat.icon}
            </div>
            <div style={styles.label}>{cat.label}</div>
          </button>
        );
      })}
    </div>
  );
}

var styles = {
  wrap: { display: "flex", gap: 8, flexWrap: "wrap" },
  btn: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 6, padding: "10px 14px", borderRadius: 10,
    border: "1px solid var(--border)", background: "var(--bg-0)",
    cursor: "pointer", transition: "all 0.15s", minWidth: 72,
    fontFamily: "Inter, sans-serif",
  },
  btnActive: {
    border: "1px solid rgba(99,102,241,0.5)",
    background: "rgba(99,102,241,0.08)",
    boxShadow: "0 0 0 1px rgba(99,102,241,0.2)",
  },
  icon: { color: "var(--text-3)", transition: "color 0.15s" },
  iconActive: { color: "#6366f1" },
  label: { fontSize: 10, fontWeight: 600, color: "var(--text-2)", letterSpacing: "0.3px" },
};

export { CATEGORIES };
export default CategorySelector;