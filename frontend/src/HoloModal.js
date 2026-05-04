import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
 
var ACCENT_COLORS = [
  0x00e5ff, 0x00ff88, 0xff6b6b, 0xffd93d,
  0xc77dff, 0xff9a3c, 0xff6eb4, 0x7eb8ff
];
var ACCENT_HEX = [
  "#00e5ff","#00ff88","#ff6b6b","#ffd93d",
  "#c77dff","#ff9a3c","#ff6eb4","#7eb8ff"
];
 
function getType(name) {
  var n = name.toLowerCase();
  if (n.includes("battery") || n.includes("lipo") || n.includes("power")) return "battery";
  if (n.includes("display") || n.includes("screen") || n.includes("oled") || n.includes("lcd")) return "display";
  if (n.includes("camera") || n.includes("lens")) return "camera";
  if (n.includes("motor") || n.includes("servo")) return "motor";
  if (n.includes("sensor") || n.includes("gyro") || n.includes("imu") || n.includes("accel")) return "sensor";
  if (n.includes("antenna") || n.includes("wifi") || n.includes("esp") || n.includes("bluetooth")) return "antenna";
  if (n.includes("speaker") || n.includes("audio") || n.includes("mic")) return "speaker";
  return "chip";
}
 
function getPins(type) {
  var map = {
    battery: ["VCC+","GND","CHG","VBAT"],
    display: ["SDA","SCL","VCC","GND","RST","DC"],
    camera: ["SDA","SCL","VSYNC","HREF","PCLK","XCLK","VCC","GND"],
    motor: ["PWM","DIR","BRK","VCC","GND"],
    sensor: ["SDA","SCL","INT","VCC","GND"],
    antenna: ["TX","RX","EN","RST","VCC","GND"],
    speaker: ["BCLK","LRCLK","DIN","VCC","GND"],
    chip: ["VCC","GND","TX","RX","D0","D1","D2","D3"],
  };
  return map[type] || map.chip;
}
 
function getSpecs(comp, type) {
  var price = comp.estimated_price_usd;
  var specs = {
    battery:  { Voltage:"3.7V", Capacity:"2000mAh", Discharge:"1C", Protocol:"I2C" },
    display:  { Interface:"I2C/SPI", Resolution:"128×64", Voltage:"3.3V", Driver:"SSD1306" },
    camera:   { Resolution:"2MP", Interface:"DVP/CSI", FPS:"30fps", Voltage:"2.8V" },
    motor:    { Torque:"0.8kg·cm", RPM:"200", Interface:"PWM", Current:"1.2A" },
    sensor:   { Interface:"I2C", Range:"±16g", DOF:"6-axis", Voltage:"3.3V" },
    antenna:  { Protocol:"802.11 b/g/n", Range:"100m", Band:"2.4GHz", Power:"20dBm" },
    speaker:  { Interface:"I2S", SNR:"90dB", Power:"3W", THD:"<1%" },
    chip:     { Interface:"UART/SPI", Clock:"240MHz", Flash:"4MB", Voltage:"3.3V" },
  };
  var base = specs[type] || specs.chip;
  base["Est. Cost"] = "$" + price;
  return base;
}
 
function buildSpinMesh(type, color) {
  var group = new THREE.Group();
  var mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.92 });
  var dark = new THREE.MeshStandardMaterial({ color: 0x030310, metalness: 0.9, roughness: 0.4 });
  var glow = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.5, transparent: true, opacity: 0.85 });
 
  if (type === "battery") {
    group.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 1.1), mat)));
    var nub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.25, 12), glow);
    nub.rotation.z = Math.PI / 2; nub.position.x = 1.22;
    group.add(nub);
    for (var i = 0; i < 3; i++) {
      var s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.87, 1.12), glow);
      s.position.x = -0.6 + i * 0.6; group.add(s);
    }
  } else if (type === "display") {
    group.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.14), dark));
    var scr = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.2, 0.08),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, transparent: true, opacity: 0.7 }));
    scr.position.z = 0.08; group.add(scr);
    for (var j = 0; j < 6; j++) {
      var ln = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.035, 0.09),
        new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.5 }));
      ln.position.set(0, -0.5 + j * 0.2, 0.1); group.add(ln);
    }
  } else if (type === "motor") {
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.3, 32), mat));
    var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 16), glow);
    shaft.position.y = 1.0; group.add(shaft);
    for (var f = 0; f < 8; f++) {
      var fin = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.1, 0.18), dark);
      var fa = (f / 8) * Math.PI * 2;
      fin.position.set(Math.cos(fa) * 0.62, 0, Math.sin(fa) * 0.62);
      fin.rotation.y = fa; group.add(fin);
    }
  } else if (type === "sensor") {
    group.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.25), dark));
    group.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), mat), { rotation: { x: 0, y: 0, z: 0 } }));
    for (var k = 1; k <= 3; k++) {
      var ring = new THREE.Mesh(new THREE.TorusGeometry(k * 0.25, 0.03, 8, 48),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7, transparent: true, opacity: 0.5 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.13; group.add(ring);
    }
  } else if (type === "antenna") {
    group.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 1.1), dark));
    var stick = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.5, 12), mat);
    stick.position.y = 1.05; group.add(stick);
    var tip2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), glow);
    tip2.position.y = 1.85; group.add(tip2);
    var bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.07, 0.07), mat);
    bar2.position.y = 1.3; group.add(bar2);
  } else if (type === "camera") {
    group.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 0.75), dark));
    var lens = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.4, 32), mat);
    lens.rotation.x = Math.PI / 2; lens.position.z = 0.55; group.add(lens);
    var iris = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.45, 32),
      new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 1, roughness: 0 }));
    iris.rotation.x = Math.PI / 2; iris.position.z = 0.6; group.add(iris);
  } else if (type === "speaker") {
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.2, 32), dark));
    var cone = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.5, 32), mat);
    cone.rotation.x = Math.PI; cone.position.y = -0.15; group.add(cone);
    var cap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), glow);
    cap.rotation.x = Math.PI; cap.position.y = 0.1; group.add(cap);
  } else {
    // chip
    group.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.28, 1.1), dark));
    group.add(new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.3, 1.08),
      new THREE.MeshStandardMaterial({ color: 0x0a0a1a, metalness: 0.5, roughness: 0.6 })));
    var dotM = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12), glow);
    dotM.position.set(-0.5, 0.17, -0.38); group.add(dotM);
    var pm = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.2 });
    for (var p = 0; p < 5; p++) {
      var px = -0.5 + p * 0.25;
      var pt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.22), pm);
      pt.position.set(px, -0.14, 0.66);
      var pb = pt.clone(); pb.position.z = -0.66;
      group.add(pt, pb);
    }
  }
  return group;
}
 
// ── The Modal ────────────────────────────────────────────────────────────────
function HoloModal({ comp, index, onClose }) {
  var mountRef = useRef(null);
  var [visible, setVisible] = useState(false);
 
  var color = ACCENT_HEX[index % ACCENT_HEX.length];
  var threeColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
  var type = getType(comp.name);
  var pins = getPins(type);
  var specs = getSpecs(comp, type);
 
  // animate in
  useEffect(function () {
    var t = setTimeout(function () { setVisible(true); }, 10);
    return function () { clearTimeout(t); };
  }, []);
 
  // Three.js spinning mesh
  useEffect(function () {
    if (!mountRef.current) return;
    var el = mountRef.current;
    var W = el.clientWidth || 220;
    var H = el.clientHeight || 220;
 
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
 
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 50);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0, 0);
 
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    var dl = new THREE.DirectionalLight(0xffffff, 1.0);
    dl.position.set(3, 5, 3);
    scene.add(dl);
    var pl = new THREE.PointLight(threeColor, 3, 12);
    pl.position.set(0, 2, 3);
    scene.add(pl);
 
    // outer holo rings
    for (var r = 0; r < 3; r++) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.8 + r * 0.5, 0.018, 8, 64),
        new THREE.MeshStandardMaterial({ color: threeColor, emissive: threeColor, emissiveIntensity: 0.6, transparent: true, opacity: 0.25 - r * 0.06 })
      );
      ring.rotation.x = Math.PI / 2 + r * 0.3;
      ring.userData.speed = 0.008 + r * 0.004;
      ring.userData.axis = r % 2 === 0 ? "y" : "x";
      scene.add(ring);
    }
 
    var mesh = buildSpinMesh(type, threeColor);
    scene.add(mesh);
 
    var t2 = 0;
    var id;
    function animate() {
      id = requestAnimationFrame(animate);
      t2 += 0.016;
      mesh.rotation.y += 0.012;
      mesh.position.y = Math.sin(t2 * 1.2) * 0.08;
      scene.children.forEach(function (o) {
        if (o.userData.speed) {
          if (o.userData.axis === "y") o.rotation.y += o.userData.speed;
          else o.rotation.x += o.userData.speed;
        }
      });
      renderer.render(scene, camera);
    }
    animate();
 
    return function () {
      cancelAnimationFrame(id);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [comp, threeColor, type]);
 
  function close() {
    setVisible(false);
    setTimeout(onClose, 220);
  }
 
  return (
    <div onClick={close} style={{ ...s.backdrop, opacity: visible ? 1 : 0 }}>
      <div onClick={function (e) { e.stopPropagation(); }}
        style={{ ...s.modal, transform: visible ? "scale(1) translateY(0)" : "scale(0.88) translateY(30px)", opacity: visible ? 1 : 0, "--c": color }}>
 
        {/* scanline overlay */}
        <div style={s.scanlines} />
 
        {/* top bar */}
        <div style={{ ...s.topbar, borderColor: color + "55" }}>
          <div style={s.topbarLeft}>
            <div style={{ ...s.dot, background: color, boxShadow: "0 0 10px " + color }} />
            <span style={{ ...s.sysLabel, color: color }}>ARCH-SYS // COMPONENT SCAN</span>
          </div>
          <div style={s.topbarRight}>
            <span style={s.indexLabel}>IDX_{String(index).padStart(3, "0")}</span>
            <button onClick={close} style={{ ...s.closeBtn, borderColor: color + "66", color: color }}>✕ CLOSE</button>
          </div>
        </div>
 
        {/* main body */}
        <div style={s.body}>
 
          {/* left: 3D viewer */}
          <div style={s.left}>
            <div ref={mountRef} style={s.threeMount} />
            <div style={{ ...s.compName, color }}>{comp.name.toUpperCase()}</div>
            <div style={s.compType}>{type.toUpperCase()} MODULE</div>
            <div style={{ ...s.priceBadge, borderColor: color + "88", color }}>
              ${comp.estimated_price_usd} USD
            </div>
          </div>
 
          {/* right: details */}
          <div style={s.right}>
 
            {/* purpose */}
            <div style={{ ...s.section, borderColor: color + "33" }}>
              <div style={{ ...s.sectionTitle, color }}>▸ FUNCTION</div>
              <div style={s.purposeText}>{comp.purpose}</div>
            </div>
 
            {/* specs grid */}
            <div style={{ ...s.section, borderColor: color + "33" }}>
              <div style={{ ...s.sectionTitle, color }}>▸ SPECIFICATIONS</div>
              <div style={s.specsGrid}>
                {Object.entries(specs).map(function ([k, v]) {
                  return (
                    <div key={k} style={s.specRow}>
                      <span style={s.specKey}>{k}</span>
                      <span style={{ ...s.specVal, color }}>{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>
 
            {/* pin diagram */}
            <div style={{ ...s.section, borderColor: color + "33" }}>
              <div style={{ ...s.sectionTitle, color }}>▸ PIN MAP</div>
              <div style={s.pinGrid}>
                {pins.map(function (pin, i) {
                  return (
                    <div key={i} style={{ ...s.pin, borderColor: color + "55", background: color + "11" }}>
                      <div style={{ ...s.pinNum, color: color + "aa" }}>P{i}</div>
                      <div style={{ ...s.pinLabel, color }}>{pin}</div>
                    </div>
                  );
                })}
              </div>
            </div>
 
          </div>
        </div>
 
        {/* bottom status bar */}
        <div style={{ ...s.statusBar, borderColor: color + "33" }}>
          <span style={{ color: color + "88", fontSize: 9, fontFamily: "monospace", letterSpacing: 1 }}>
            STATUS: NOMINAL &nbsp;·&nbsp; SIGNAL: STRONG &nbsp;·&nbsp; TEMP: 42°C &nbsp;·&nbsp; INTEGRITY: 100%
          </span>
          <span style={{ color: color + "44", fontSize: 9, fontFamily: "monospace" }}>
            AI-HW-ARCH v0.1
          </span>
        </div>
 
      </div>
    </div>
  );
}
 
var s = {
  backdrop: {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.85)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "opacity 0.2s ease",
    backdropFilter: "blur(6px)",
  },
  modal: {
    position: "relative",
    width: 720, maxWidth: "95vw",
    background: "rgba(4,4,16,0.97)",
    border: "1px solid rgba(0,229,255,0.2)",
    borderRadius: 4,
    boxShadow: "0 0 60px rgba(0,229,255,0.08), inset 0 0 40px rgba(0,229,255,0.02)",
    overflow: "hidden",
    transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
    fontFamily: "'Courier New', monospace",
  },
  scanlines: {
    position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.015) 2px, rgba(0,229,255,0.015) 4px)",
  },
  topbar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 16px", borderBottom: "1px solid",
    position: "relative", zIndex: 1,
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: 8 },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  dot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  sysLabel: { fontSize: 9, fontWeight: 700, letterSpacing: 2 },
  indexLabel: { fontSize: 9, color: "#333", letterSpacing: 1 },
  closeBtn: {
    background: "transparent", border: "1px solid",
    padding: "4px 10px", borderRadius: 2,
    fontSize: 9, fontWeight: 700, cursor: "pointer",
    letterSpacing: 1, fontFamily: "monospace",
    transition: "all 0.15s",
  },
  body: {
    display: "flex", gap: 0,
    position: "relative", zIndex: 1,
  },
  left: {
    width: 220, flexShrink: 0,
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "16px 12px",
    borderRight: "1px solid rgba(0,229,255,0.1)",
  },
  threeMount: {
    width: 200, height: 200,
    borderRadius: 4,
    overflow: "hidden",
  },
  compName: {
    marginTop: 10, fontSize: 11, fontWeight: 700,
    letterSpacing: 2, textAlign: "center", lineHeight: 1.4,
  },
  compType: {
    fontSize: 8, color: "#333", letterSpacing: 2, marginTop: 3,
  },
  priceBadge: {
    marginTop: 10, border: "1px solid",
    padding: "4px 14px", borderRadius: 2,
    fontSize: 12, fontWeight: 700, letterSpacing: 1,
  },
  right: {
    flex: 1, padding: "14px 16px",
    display: "flex", flexDirection: "column", gap: 12,
  },
  section: {
    border: "1px solid",
    borderRadius: 3, padding: "10px 12px",
  },
  sectionTitle: {
    fontSize: 8, fontWeight: 700, letterSpacing: 2,
    marginBottom: 8,
  },
  purposeText: {
    fontSize: 11, color: "#888", lineHeight: 1.7,
  },
  specsGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px",
  },
  specRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 4,
  },
  specKey: { fontSize: 9, color: "#444", letterSpacing: 0.5 },
  specVal: { fontSize: 10, fontWeight: 700, letterSpacing: 0.5 },
  pinGrid: {
    display: "flex", flexWrap: "wrap", gap: 5,
  },
  pin: {
    border: "1px solid", borderRadius: 2,
    padding: "4px 8px", minWidth: 44,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
  },
  pinNum: { fontSize: 7, letterSpacing: 1 },
  pinLabel: { fontSize: 9, fontWeight: 700, letterSpacing: 1 },
  statusBar: {
    padding: "7px 16px", borderTop: "1px solid",
    display: "flex", justifyContent: "space-between",
    position: "relative", zIndex: 1,
  },
};
 
export default HoloModal;
 