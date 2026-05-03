import { useEffect, useRef } from "react";

var COLORS = ["#6366f1","#00ff88","#ff6b6b","#fbbf24","#a78bfa","#ff9a3c","#ff6eb4","#7eb8ff"];

function getPin(name) {
  var n = name.toLowerCase();
  if (n.includes("display") || n.includes("oled") || n.includes("lcd")) return ["SDA","SCL","VCC","GND"];
  if (n.includes("camera")) return ["SDA","SCL","VSYNC","HREF","PCLK"];
  if (n.includes("battery") || n.includes("power")) return ["VCC","GND"];
  if (n.includes("motor") || n.includes("servo")) return ["PWM","VCC","GND"];
  if (n.includes("sensor") || n.includes("gyro") || n.includes("imu")) return ["SDA","SCL","INT","VCC","GND"];
  if (n.includes("wifi") || n.includes("esp") || n.includes("bluetooth")) return ["TX","RX","EN","VCC","GND"];
  if (n.includes("speaker") || n.includes("audio")) return ["DATA","BCK","LCK","VCC","GND"];
  return ["VCC","GND","SIG","TX","RX"];
}

function WiringDiagram({ components }) {
  var canvasRef = useRef(null);

  useEffect(function() {
    if (!components || components.length === 0) return;
    var canvas = canvasRef.current;
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // background
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (var gx = 0; gx < W; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (var gy = 0; gy < H; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    var cols = Math.min(components.length, 4);
    var rows = Math.ceil(components.length / cols);
    var cellW = W / cols;
    var cellH = H / rows;
    var cardW = 110;
    var cardH = 70;

    var positions = components.map(function(_, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      return {
        x: cellW * col + cellW / 2,
        y: cellH * row + cellH / 2,
      };
    });

    // draw wires between components
    components.forEach(function(_, i) {
      components.forEach(function(_, j) {
        if (j <= i) return;
        var p1 = positions[i];
        var p2 = positions[j];
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 280) return;

        ctx.save();
        ctx.strokeStyle = COLORS[i % COLORS.length] + "44";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        var mx = (p1.x + p2.x) / 2;
        ctx.bezierCurveTo(mx, p1.y, mx, p2.y, p2.x, p2.y);
        ctx.stroke();
        ctx.restore();

        // wire label
        var pins1 = getPin(components[i].name);
        var pins2 = getPin(components[j].name);
        var shared = pins1.find(function(p) { return pins2.includes(p); }) || "SIG";
        ctx.save();
        ctx.fillStyle = "rgba(99,102,241,0.8)";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(shared, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 4);
        ctx.restore();
      });
    });

    // draw component cards
    components.forEach(function(c, i) {
      var pos = positions[i];
      var color = COLORS[i % COLORS.length];
      var pins = getPin(c.name).slice(0, 4);

      ctx.save();

      // card bg
      ctx.fillStyle = "#111113";
      ctx.strokeStyle = color + "66";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pos.x - cardW/2, pos.y - cardH/2, cardW, cardH, 8);
      ctx.fill();
      ctx.stroke();

      // color accent top bar
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(pos.x - cardW/2, pos.y - cardH/2, cardW, 3, [8, 8, 0, 0]);
      ctx.fill();

      // component name
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px Inter, sans-serif";
      ctx.textAlign = "center";
      var short = c.name.length > 14 ? c.name.slice(0, 14) + ".." : c.name;
      ctx.fillText(short, pos.x, pos.y - cardH/2 + 18);

      // pins
      pins.forEach(function(pin, pi) {
        var px = pos.x - cardW/2 + 14 + pi * (cardW - 14) / pins.length;
        var py = pos.y + cardH/2 - 14;

        ctx.fillStyle = "#1c1c1f";
        ctx.strokeStyle = color + "88";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(px - 10, py - 7, 20, 14, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = "7px monospace";
        ctx.textAlign = "center";
        ctx.fillText(pin, px, py + 3);
      });

      // price tag
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("$" + c.estimated_price_usd, pos.x + cardW/2 - 6, pos.y - cardH/2 + 18);

      ctx.restore();
    });

  }, [components]);

  if (!components || components.length === 0) return null;

  var cols = Math.min(components.length, 4);
  var rows = Math.ceil(components.length / cols);
  var h = Math.max(300, rows * 160);

  return (
    <div className="card" style={{ gridColumn: "1 / -1" }}>
      <div className="card-header">
        <span className="card-title">Wiring Diagram</span>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>
          {components.length} components — dashed lines show connections
        </span>
      </div>
      <div style={{ padding: "16px", background: "var(--bg-0)", borderRadius: "0 0 12px 12px" }}>
        <canvas
          ref={canvasRef}
          width={760}
          height={h}
          style={{ width: "100%", borderRadius: 8, display: "block" }}
        />
      </div>
    </div>
  );
}

export default WiringDiagram;