import { useRef, useEffect, useState } from "react";

var COLORS = ["#00e5ff", "#00ff88", "#ff6b6b", "#ffd93d", "#c77dff", "#ff9a3c"];

function Viewer3D({ components, selectedIndex, onSelect }) {
  var canvasRef = useRef(null);
  var angleRef = useRef(0);
  var animRef = useRef(null);
  var [hovered, setHovered] = useState(null);

  useEffect(function() {
    if (!components || components.length === 0) return;
    var canvas = canvasRef.current;
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;

    function getPositions() {
      return components.map(function(_, i) {
        var angle = (i / components.length) * Math.PI * 2 + angleRef.current;
        var radius = 90 + components.length * 5;
        var x = W / 2 + Math.cos(angle) * radius;
        var y = H / 2 + Math.sin(angle) * radius * 0.45;
        var z = Math.sin(angle);
        return { x: x, y: y, z: z };
      });
    }

    function drawBox(ctx, x, y, size, color, label, selected, isHovered) {
      var s = selected ? size * 1.3 : isHovered ? size * 1.15 : size;
      var h = s * 0.6;
      var d = s * 0.3;

      ctx.save();

      // top face
      ctx.beginPath();
      ctx.moveTo(x, y - h / 2);
      ctx.lineTo(x + s / 2, y - h / 2 - d);
      ctx.lineTo(x + s / 2 + s / 2, y - h / 2 - d + d);
      ctx.lineTo(x + s / 2, y - h / 2 + d);
      ctx.closePath();
      ctx.fillStyle = selected ? "#ffffff" : color + "cc";
      ctx.fill();

      // front face
      ctx.beginPath();
      ctx.moveTo(x - s / 2, y - h / 2);
      ctx.lineTo(x + s / 2, y - h / 2);
      ctx.lineTo(x + s / 2, y + h / 2);
      ctx.lineTo(x - s / 2, y + h / 2);
      ctx.closePath();
      ctx.fillStyle = selected ? "#cccccc" : color + "99";
      ctx.fill();
      ctx.strokeStyle = selected ? "#ffffff" : color;
      ctx.lineWidth = selected ? 2 : 1;
      ctx.stroke();

      // right face
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y - h / 2);
      ctx.lineTo(x + s / 2 + s / 2, y - h / 2 - d + d);
      ctx.lineTo(x + s / 2 + s / 2, y + h / 2 - d + d);
      ctx.lineTo(x + s / 2, y + h / 2);
      ctx.closePath();
      ctx.fillStyle = selected ? "#aaaaaa" : color + "66";
      ctx.fill();
      ctx.strokeStyle = selected ? "#ffffff" : color;
      ctx.stroke();

      // label
      ctx.fillStyle = selected ? "#ffffff" : "#cccccc";
      ctx.font = "11px Segoe UI";
      ctx.textAlign = "center";
      var short = label.length > 10 ? label.slice(0, 10) + ".." : label;
      ctx.fillText(short, x, y + h / 2 + 16);

      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // background grid
      ctx.strokeStyle = "#1e1e2e";
      ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (var gy = 0; gy < H; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      var positions = getPositions();
      var sorted = components.map(function(c, i) {
        return { c: c, i: i, pos: positions[i] };
      }).sort(function(a, b) { return a.pos.z - b.pos.z; });

      sorted.forEach(function(item) {
        var size = 44 + item.pos.z * 10;
        drawBox(
          ctx,
          item.pos.x,
          item.pos.y,
          size,
          COLORS[item.i % COLORS.length],
          item.c.name,
          selectedIndex === item.i,
          hovered === item.i
        );
      });

      angleRef.current += 0.008;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return function() { cancelAnimationFrame(animRef.current); };
  }, [components, selectedIndex, hovered]);

  var handleClick = function(e) {
    if (!components || components.length === 0) return;
    var canvas = canvasRef.current;
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var W = canvas.width;
    var H = canvas.height;

    components.forEach(function(_, i) {
      var angle = (i / components.length) * Math.PI * 2 + angleRef.current;
      var radius = 90 + components.length * 5;
      var x = W / 2 + Math.cos(angle) * radius;
      var y = H / 2 + Math.sin(angle) * radius * 0.45;
      if (Math.abs(mx - x) < 35 && Math.abs(my - y) < 35) {
        onSelect(i);
      }
    });
  };

  var handleMove = function(e) {
    if (!components || components.length === 0) return;
    var canvas = canvasRef.current;
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var W = canvas.width;
    var H = canvas.height;
    var found = null;
    components.forEach(function(_, i) {
      var angle = (i / components.length) * Math.PI * 2 + angleRef.current;
      var radius = 90 + components.length * 5;
      var x = W / 2 + Math.cos(angle) * radius;
      var y = H / 2 + Math.sin(angle) * radius * 0.45;
      if (Math.abs(mx - x) < 35 && Math.abs(my - y) < 35) {
        found = i;
      }
    });
    setHovered(found);
  };

  var selected = components && selectedIndex !== null ? components[selectedIndex] : null;

  return (
    <div className="viewer-panel">
      <div className="viewer-topbar">3D Device Viewer — click a part to inspect</div>
      <div className="viewer-canvas" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#080810" }}>
        {!components || components.length === 0 ? (
          <div style={{ color: "#333", fontSize: 13 }}>Design a device to see the 3D view</div>
        ) : (
          <canvas
            ref={canvasRef}
            width={320}
            height={280}
            onClick={handleClick}
            onMouseMove={handleMove}
            style={{ cursor: "pointer" }}
          />
        )}
      </div>
      <div className="part-info">
        {selected ? (
          <>
            <div className="part-info-name">{selected.name}</div>
            <div className="part-info-desc">{selected.purpose}</div>
            <div style={{ color: "#00ff88", fontSize: 13, marginTop: 6 }}>${selected.estimated_price_usd}</div>
          </>
        ) : (
          <div className="part-info-desc">Click a part to see details</div>
        )}
      </div>
    </div>
  );
}

export default Viewer3D;