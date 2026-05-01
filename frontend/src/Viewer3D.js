import { useRef, useEffect, useState } from "react";

var COLORS = ["#00e5ff", "#00ff88", "#ff6b6b", "#ffd93d", "#c77dff", "#ff9a3c", "#ff6eb4", "#7eb8ff"];

function getShapeType(name) {
  var n = name.toLowerCase();
  if (n.includes("battery") || n.includes("power")) return "battery";
  if (n.includes("display") || n.includes("screen") || n.includes("oled") || n.includes("lcd")) return "display";
  if (n.includes("camera") || n.includes("lens")) return "camera";
  if (n.includes("motor") || n.includes("servo")) return "motor";
  if (n.includes("sensor") || n.includes("gyro") || n.includes("imu") || n.includes("accelero")) return "sensor";
  if (n.includes("antenna") || n.includes("wifi") || n.includes("bluetooth") || n.includes("wireless") || n.includes("esp")) return "antenna";
  if (n.includes("speaker") || n.includes("audio") || n.includes("buzz")) return "speaker";
  return "chip";
}

function drawShape(ctx, type, x, y, size, color, selected, hovered) {
  var s = selected ? size * 1.25 : hovered ? size * 1.1 : size;
  var glow = selected ? 0.9 : hovered ? 0.5 : 0.25;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = selected ? 24 : hovered ? 14 : 8;

  if (type === "battery") {
    var bw = s * 1.4, bh = s * 0.7;
    var grad = ctx.createLinearGradient(x - bw/2, y, x + bw/2, y);
    grad.addColorStop(0, color + "cc");
    grad.addColorStop(1, color + "44");
    ctx.fillStyle = grad;
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(x - bw/2, y - bh/2, bw, bh, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + bw/2, y - bh/4, 5, bh/2, 2);
    ctx.fill();
    for (var i = 0; i < 3; i++) {
      ctx.strokeStyle = color + "66";
      ctx.beginPath();
      ctx.moveTo(x - bw/2 + 12 + i * 14, y - bh/2 + 4);
      ctx.lineTo(x - bw/2 + 12 + i * 14, y + bh/2 - 4);
      ctx.stroke();
    }
  } else if (type === "display") {
    var dw = s * 1.5, dh = s * 1.0;
    ctx.fillStyle = "#000";
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.roundRect(x - dw/2, y - dh/2, dw, dh, 6);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = color + "33";
    ctx.beginPath();
    ctx.roundRect(x - dw/2 + 4, y - dh/2 + 4, dw - 8, dh - 8, 3);
    ctx.fill();
    ctx.fillStyle = color + "88";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("DISPLAY", x, y + 3);
  } else if (type === "camera") {
    ctx.fillStyle = "#111";
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? 2 : 1.5;
    ctx.beginPath();
    ctx.roundRect(x - s*0.6, y - s*0.5, s*1.2, s, 5);
    ctx.fill(); ctx.stroke();
    var grad2 = ctx.createRadialGradient(x, y, 2, x, y, s*0.35);
    grad2.addColorStop(0, color + "99");
    grad2.addColorStop(1, color + "22");
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, s * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
  } else if (type === "motor") {
    ctx.fillStyle = color + "44";
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? 2 : 1.5;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, s * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = color + "88";
    ctx.fill();
    for (var j = 0; j < 6; j++) {
      var a = (j / 6) * Math.PI * 2;
      ctx.strokeStyle = color + "66";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * s * 0.28, y + Math.sin(a) * s * 0.28);
      ctx.lineTo(x + Math.cos(a) * s * 0.48, y + Math.sin(a) * s * 0.48);
      ctx.stroke();
    }
  } else if (type === "sensor") {
    var sw = s * 0.9, sh = s * 0.9;
    ctx.fillStyle = color + "22";
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(x - sw/2, y - sh/2, sw, sh, 3);
    ctx.fill(); ctx.stroke();
    for (var k = 0; k < 3; k++) {
      ctx.strokeStyle = color + (k === 0 ? "99" : k === 1 ? "55" : "22");
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, s * (0.15 + k * 0.15), 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (type === "antenna") {
    ctx.fillStyle = color + "33";
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? 2 : 1.5;
    ctx.beginPath();
    ctx.roundRect(x - s*0.5, y, s, s*0.5, 3);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? 2.5 : 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - s * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - s*0.3, y - s*0.4);
    ctx.lineTo(x + s*0.3, y - s*0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - s*0.2, y - s*0.55);
    ctx.lineTo(x + s*0.2, y - s*0.55);
    ctx.stroke();
  } else if (type === "speaker") {
    ctx.fillStyle = color + "33";
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? 2 : 1.5;
    ctx.beginPath();
    ctx.arc(x, y, s*0.5, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    for (var m = 1; m <= 3; m++) {
      ctx.beginPath();
      ctx.arc(x, y, s * 0.12 * m, 0, Math.PI * 2);
      ctx.strokeStyle = color + (m === 1 ? "99" : m === 2 ? "55" : "22");
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else {
    var cw = s * 1.1, ch = s * 0.9;
    var chipGrad = ctx.createLinearGradient(x - cw/2, y - ch/2, x + cw/2, y + ch/2);
    chipGrad.addColorStop(0, color + "55");
    chipGrad.addColorStop(1, color + "22");
    ctx.fillStyle = chipGrad;
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(x - cw/2, y - ch/2, cw, ch, 4);
    ctx.fill(); ctx.stroke();
    var pinCount = 4;
    for (var p = 0; p < pinCount; p++) {
      var px1 = x - cw/2 + (cw / (pinCount+1)) * (p+1);
      ctx.strokeStyle = color + "88";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px1, y - ch/2); ctx.lineTo(px1, y - ch/2 - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px1, y + ch/2); ctx.lineTo(px1, y + ch/2 + 6); ctx.stroke();
    }
    ctx.fillStyle = color + "44";
    ctx.beginPath();
    ctx.arc(x - cw/2 + 8, y - ch/2 + 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function calcFeasibility(components) {
  var totalCost = components.reduce(function(s, c) { return s + c.estimated_price_usd; }, 0);
  var power = components.length * 80 + Math.random() * 50;
  var weight = components.length * 12 + Math.random() * 20;
  var complexity = Math.min(100, components.length * 14);
  var feasibility = Math.max(40, 100 - components.length * 3 - (totalCost > 300 ? 10 : 0));
  return {
    power: Math.round(power),
    weight: Math.round(weight),
    complexity: Math.round(complexity),
    feasibility: Math.round(feasibility),
  };
}

function Viewer3D({ components, selectedIndex, onSelect, exploded }) {
  var canvasRef = useRef(null);
  var angleRef = useRef(0);
  var animRef = useRef(null);
  var [hovered, setHovered] = useState(null);
  var stats = components && components.length > 0 ? calcFeasibility(components) : null;

  useEffect(function() {
    if (!components || components.length === 0) return;
    var canvas = canvasRef.current;
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;

    function getPositions() {
      return components.map(function(_, i) {
        var angle = (i / components.length) * Math.PI * 2 + angleRef.current;
        var explodeRadius = exploded ? 130 : 0;
        var baseRadius = 80 + components.length * 6;
        var radius = baseRadius + explodeRadius;
        var x = W/2 + Math.cos(angle) * radius;
        var y = H/2 + Math.sin(angle) * radius * 0.5;
        var z = Math.sin(angle);
        return { x, y, z };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      var positions = getPositions();

      if (!exploded) {
        positions.forEach(function(pos, i) {
          positions.forEach(function(pos2, j) {
            if (j <= i) return;
            ctx.save();
            ctx.strokeStyle = COLORS[i % COLORS.length] + "22";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 6]);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos2.x, pos2.y);
            ctx.stroke();
            ctx.restore();
          });
        });
      }

      var sorted = components.map(function(c, i) {
        return { c, i, pos: positions[i] };
      }).sort(function(a, b) { return a.pos.z - b.pos.z; });

      sorted.forEach(function(item) {
        var size = 28 + item.pos.z * 8;
        var type = getShapeType(item.c.name);
        drawShape(ctx, type, item.pos.x, item.pos.y, size, COLORS[item.i % COLORS.length], selectedIndex === item.i, hovered === item.i);

        ctx.save();
        ctx.fillStyle = selectedIndex === item.i ? "#fff" : "#888";
        ctx.font = (selectedIndex === item.i ? "bold " : "") + "10px Segoe UI";
        ctx.textAlign = "center";
        var short = item.c.name.length > 11 ? item.c.name.slice(0, 11) + ".." : item.c.name;
        ctx.fillText(short, item.pos.x, item.pos.y + 36);
        ctx.restore();
      });

      angleRef.current += exploded ? 0.003 : 0.006;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return function() { cancelAnimationFrame(animRef.current); };
  }, [components, selectedIndex, hovered, exploded]);

  var handleClick = function(e) {
    if (!components || components.length === 0) return;
    var canvas = canvasRef.current;
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var W = canvas.width, H = canvas.height;
    components.forEach(function(_, i) {
      var angle = (i / components.length) * Math.PI * 2 + angleRef.current;
      var radius = 80 + components.length * 6 + (exploded ? 130 : 0);
      var x = W/2 + Math.cos(angle) * radius;
      var y = H/2 + Math.sin(angle) * radius * 0.5;
      if (Math.abs(mx - x) < 38 && Math.abs(my - y) < 38) onSelect(i);
    });
  };

  var handleMove = function(e) {
    if (!components || components.length === 0) return;
    var canvas = canvasRef.current;
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var W = canvas.width, H = canvas.height;
    var found = null;
    components.forEach(function(_, i) {
      var angle = (i / components.length) * Math.PI * 2 + angleRef.current;
      var radius = 80 + components.length * 6 + (exploded ? 130 : 0);
      var x = W/2 + Math.cos(angle) * radius;
      var y = H/2 + Math.sin(angle) * radius * 0.5;
      if (Math.abs(mx - x) < 38 && Math.abs(my - y) < 38) found = i;
    });
    setHovered(found);
  };

  var selected = components && selectedIndex !== null ? components[selectedIndex] : null;

  function StatBar({ label, value, max, color }) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div className="feasibility-row">
          <span className="feasibility-label">{label}</span>
          <span className="feasibility-value" style={{ color }}>{value}</span>
        </div>
        <div className="feasibility-bar-bg" style={{ marginTop: 4 }}>
          <div className="feasibility-bar-fill" style={{ width: Math.min(100, (value/max)*100) + "%", background: color }} />
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-panel">
      <div className="viewer-topbar">
        {exploded ? "Exploded View — parts separated" : "3D Viewer — click a part"}
      </div>
      <div className="viewer-canvas">
        {!components || components.length === 0 ? (
          <div style={{ color: "#222", fontSize: 12, textAlign: "center", padding: 20 }}>
            Design a device to see the 3D view
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={300}
            height={260}
            onClick={handleClick}
            onMouseMove={handleMove}
            style={{ cursor: hovered !== null ? "pointer" : "default" }}
          />
        )}
      </div>

      <div className="part-info">
        {selected ? (
          <>
            <div className="part-info-name">{selected.name}</div>
            <div className="part-info-desc">{selected.purpose}</div>
            <div style={{ color: "#00ff88", fontSize: 13, marginTop: 6, fontWeight: 700 }}>${selected.estimated_price_usd}</div>
          </>
        ) : (
          <div className="part-info-desc">Click a part to inspect it</div>
        )}
      </div>

      {stats && (
        <div className="feasibility-panel">
          <StatBar label="Power draw" value={stats.power + "mW"} max={500} color="#ffd93d" />
          <StatBar label="Est. weight" value={stats.weight + "g"} max={200} color="#ff9a3c" />
          <StatBar label="Complexity" value={stats.complexity + "%"} max={100} color="#c77dff" />
          <StatBar label="Feasibility" value={stats.feasibility + "%"} max={100} color="#00ff88" />
        </div>
      )}
    </div>
  );
}

export default Viewer3D;