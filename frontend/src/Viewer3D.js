import { useRef, useEffect, useState, useCallback } from "react";
import HoloModal from "./HoloModal";
import * as THREE from "three";

// ─── Component type classifier ───────────────────────────────────────────────
function getType(name) {
  var n = name.toLowerCase();
  if (n.includes("battery") || n.includes("lipo") || n.includes("power")) return "battery";
  if (n.includes("display") || n.includes("screen") || n.includes("oled") || n.includes("lcd")) return "display";
  if (n.includes("camera") || n.includes("lens")) return "camera";
  if (n.includes("motor") || n.includes("servo")) return "motor";
  if (n.includes("sensor") || n.includes("gyro") || n.includes("imu") || n.includes("accel")) return "sensor";
  if (n.includes("antenna") || n.includes("wifi") || n.includes("esp") || n.includes("bluetooth") || n.includes("radio")) return "antenna";
  if (n.includes("speaker") || n.includes("audio") || n.includes("mic") || n.includes("amp")) return "speaker";
  if (n.includes("resistor") || n.includes("capacitor") || n.includes("inductor")) return "passive";
  return "chip";
}

var ACCENT_COLORS = [
  0x00e5ff, 0x00ff88, 0xff6b6b, 0xffd93d,
  0xc77dff, 0xff9a3c, 0xff6eb4, 0x7eb8ff
];

// ─── Build a Three.js mesh for each component type ───────────────────────────
function buildMesh(type, color) {
  var group = new THREE.Group();
  var mat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.25,
    metalness: 0.7,
    roughness: 0.3,
  });
  var darkMat = new THREE.MeshStandardMaterial({ color: 0x111118, metalness: 0.9, roughness: 0.4 });
  var accentMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.9, metalness: 0, roughness: 0.5 });

  if (type === "battery") {
    // Rectangular cell with terminal nub
    var body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.9), mat);
    var nub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12), accentMat);
    nub.position.set(1.0, 0, 0);
    nub.rotation.z = Math.PI / 2;
    // stripe lines
    for (var i = 0; i < 3; i++) {
      var stripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.92), accentMat);
      stripe.position.x = -0.5 + i * 0.5;
      group.add(stripe);
    }
    group.add(body, nub);

  } else if (type === "display") {
    var bezel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.12), darkMat);
    var screen = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.95, 0.06),
      new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.6, metalness: 0, roughness: 0.1 })
    );
    screen.position.z = 0.07;
    // scanlines effect via thin boxes
    for (var s = 0; s < 5; s++) {
      var line = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.07),
        new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.4 })
      );
      line.position.set(0, -0.38 + s * 0.18, 0.09);
      group.add(line);
    }
    group.add(bezel, screen);

  } else if (type === "camera") {
    var body2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.6), darkMat);
    var lens = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.3, 24), mat);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.4;
    var iris = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 24),
      new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 1, roughness: 0 })
    );
    iris.rotation.x = Math.PI / 2;
    iris.position.z = 0.45;
    group.add(body2, lens, iris);

  } else if (type === "motor") {
    var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.0, 32), mat);
    var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16), accentMat);
    shaft.position.y = 0.8;
    // rotor fins
    for (var f = 0; f < 6; f++) {
      var fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.15), darkMat);
      var fa = (f / 6) * Math.PI * 2;
      fin.position.set(Math.cos(fa) * 0.48, 0, Math.sin(fa) * 0.48);
      fin.rotation.y = fa;
      group.add(fin);
    }
    group.add(cylinder, shaft);

  } else if (type === "sensor") {
    var base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.2), darkMat);
    var dome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    dome.position.y = 0.1;
    // concentric ring indicators
    var ringGeo = new THREE.TorusGeometry(0.5, 0.03, 8, 32);
    var ringGeo2 = new THREE.TorusGeometry(0.75, 0.025, 8, 32);
    var ringMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity: 0.6 });
    var r1 = new THREE.Mesh(ringGeo, ringMat);
    var r2 = new THREE.Mesh(ringGeo2, ringMat.clone());
    r1.rotation.x = r2.rotation.x = Math.PI / 2;
    r1.position.y = r2.position.y = 0.22;
    group.add(base, dome, r1, r2);

  } else if (type === "antenna") {
    var modem = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.9), darkMat);
    var stick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12), mat);
    stick.position.set(0, 0.85, 0);
    var tip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), accentMat);
    tip.position.set(0, 1.5, 0);
    // cross bar
    var bar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.06), mat);
    bar.position.set(0, 1.1, 0);
    group.add(modem, stick, tip, bar);

  } else if (type === "speaker") {
    var frame = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 32), darkMat);
    var cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.4, 32), mat);
    cone.rotation.x = Math.PI;
    cone.position.y = -0.12;
    var dustCap = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), accentMat);
    dustCap.rotation.x = Math.PI;
    dustCap.position.y = 0.08;
    group.add(frame, cone, dustCap);

  } else if (type === "passive") {
    // Tiny cylindrical resistor/cap
    var body3 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 16), mat);
    body3.rotation.z = Math.PI / 2;
    var lead1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), darkMat);
    lead1.rotation.z = Math.PI / 2;
    lead1.position.x = -0.55;
    var lead2 = lead1.clone();
    lead2.position.x = 0.55;
    group.add(body3, lead1, lead2);

  } else {
    // Generic IC chip
    var pkg = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.9), darkMat);
    var topMark = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.24, 0.88),
      new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.5, roughness: 0.6 })
    );
    topMark.position.y = 0.01;
    // dot marker
    var dot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), accentMat);
    dot.position.set(-0.38, 0.14, -0.3);
    // pins along edges
    var pinMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.95, roughness: 0.2 });
    var pinCount = 4;
    for (var p = 0; p < pinCount; p++) {
      var px = -0.38 + p * 0.26;
      var pinTop = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.18), pinMat);
      pinTop.position.set(px, -0.1, 0.54);
      var pinBot = pinTop.clone();
      pinBot.position.z = -0.54;
      group.add(pinTop, pinBot);
    }
    group.add(pkg, topMark, dot);
  }

  return group;
}

// ─── Feasibility calc (same logic as before) ────────────────────────────────
function calcFeasibility(components, selectedIndex) {
  var c = selectedIndex !== null && components[selectedIndex] ? components[selectedIndex] : null;
  var price = c ? c.estimated_price_usd : 0;
  var totalCost = components.reduce(function(s, x) { return s + x.estimated_price_usd; }, 0);
  var power = c ? Math.round(40 + price * 1.8 + components.length * 12) : Math.round(components.length * 80);
  var weight = c ? Math.round(8 + price * 0.4 + components.length * 3) : Math.round(components.length * 12);
  var feasibility = Math.max(38, Math.round(100 - components.length * 2.5 - (totalCost > 400 ? 12 : 0)));
  return { power, weight, feasibility };
}

// ─── Main Component ──────────────────────────────────────────────────────────
function Viewer3D({ components, selectedIndex, onSelect, exploded }) {
  var mountRef = useRef(null);
  var sceneRef = useRef(null);
  var [hovered, setHovered] = useState(null);
var [modalOpen, setModalOpen] = useState(false);
  var [ready, setReady] = useState(false);

  var stats = components && components.length > 0
    ? calcFeasibility(components, selectedIndex)
    : null;

  var selected = components && selectedIndex !== null ? components[selectedIndex] : null;

  useEffect(function () {
    if (!mountRef.current) return;
    if (!components || components.length === 0) return;

    var el = mountRef.current;
    var W = el.clientWidth || 300;
    var H = el.clientHeight || 280;

    // ── Renderer ──
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // ── Scene ──
    var scene = new THREE.Scene();
    sceneRef.current = scene;

    // ── Camera ──
    var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 5, 9);
    camera.lookAt(0, 0, 0);

    // ── Lights ──
    var ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    var dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    var rimLight = new THREE.PointLight(0x6366f1, 1.5, 20);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // ── PCB Board ──
    var pcbGeo = new THREE.BoxGeometry(8, 0.12, 6);
    var pcbMat = new THREE.MeshStandardMaterial({ color: 0x0a3d0a, metalness: 0.1, roughness: 0.8 });
    var pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.receiveShadow = true;
    pcb.position.y = -0.06;
    scene.add(pcb);

    // PCB trace lines
    var traceMat = new THREE.LineBasicMaterial({ color: 0x00aa44, transparent: true, opacity: 0.35 });
    for (var t = 0; t < 8; t++) {
      var traceGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-4 + t * 1.1, 0.07, -3),
        new THREE.Vector3(-4 + t * 1.1, 0.07, 3),
      ]);
      scene.add(new THREE.Line(traceGeo, traceMat));
    }

    // ── Grid helper under board ──
    var grid = new THREE.GridHelper(12, 20, 0x1a1a2e, 0x1a1a2e);
    grid.position.y = -0.5;
    scene.add(grid);

    // ── Place components ──
    var meshes = [];
    var ringMeshes = [];
    var glowLights = [];

    var count = components.length;
    var cols = Math.min(count, 4);
    var rows = Math.ceil(count / cols);
    var spacingX = Math.min(2.5, 7 / cols);
    var spacingZ = Math.min(2.2, 5 / rows);
    var offsetX = -(cols - 1) * spacingX / 2;
    var offsetZ = -(rows - 1) * spacingZ / 2;

    components.forEach(function (comp, i) {
      var color = ACCENT_COLORS[i % ACCENT_COLORS.length];
      var type = getType(comp.name);
      var mesh = buildMesh(type, color);

      var col = i % cols;
      var row = Math.floor(i / cols);
      var baseX = offsetX + col * spacingX;
      var baseZ = offsetZ + row * spacingZ;

      mesh.position.set(baseX, 0.5, baseZ);
      mesh.castShadow = true;
      mesh.userData = { index: i, baseX, baseZ, baseY: 0.5 };

      scene.add(mesh);
      meshes.push(mesh);

      // selection ring
      var ringGeo = new THREE.TorusGeometry(0.75, 0.04, 8, 48);
      var ringMat = new THREE.MeshStandardMaterial({
        color: color, emissive: color,
        emissiveIntensity: 1.2, transparent: true, opacity: 0,
      });
      var ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(baseX, 0.06, baseZ);
      scene.add(ring);
      ringMeshes.push(ring);

      // subtle glow point light per component
      var glow = new THREE.PointLight(color, 0, 3);
      glow.position.set(baseX, 1.5, baseZ);
      scene.add(glow);
      glowLights.push(glow);

      // solder pad dots on PCB
      var padGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12);
      var padMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.95, roughness: 0.2 });
      for (var d = 0; d < 4; d++) {
        var pad = new THREE.Mesh(padGeo, padMat);
        var da = (d / 4) * Math.PI * 2;
        pad.position.set(baseX + Math.cos(da) * 0.5, 0.01, baseZ + Math.sin(da) * 0.5);
        scene.add(pad);
      }

      // trace lines FROM this component to center
      var traceLineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.2 });
      var traceLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(baseX, 0.07, baseZ),
        new THREE.Vector3(0, 0.07, 0),
      ]);
      scene.add(new THREE.Line(traceLineGeo, traceLineMat));
    });

    // ── Orbit controls (manual) ──
    var isDragging = false;
    var prevMouse = { x: 0, y: 0 };
    var spherical = { theta: 0.4, phi: 0.9, radius: 9 };

    function updateCamera() {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0.5, 0);
    }
    updateCamera();

    var onMouseDown = function (e) { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
    var onMouseUp = function () { isDragging = false; };
    var onMouseMove = function (e) {
      if (!isDragging) return;
      var dx = e.clientX - prevMouse.x;
      var dy = e.clientY - prevMouse.y;
      spherical.theta -= dx * 0.008;
      spherical.phi = Math.max(0.3, Math.min(1.4, spherical.phi + dy * 0.006));
      prevMouse = { x: e.clientX, y: e.clientY };
      updateCamera();
    };
    var onWheel = function (e) {
      spherical.radius = Math.max(4, Math.min(18, spherical.radius + e.deltaY * 0.01));
      updateCamera();
    };

    // touch support
    var lastTouch = null;
    var onTouchStart = function (e) { lastTouch = e.touches[0]; };
    var onTouchMove = function (e) {
      if (!lastTouch) return;
      var dx = e.touches[0].clientX - lastTouch.clientX;
      var dy = e.touches[0].clientY - lastTouch.clientY;
      spherical.theta -= dx * 0.012;
      spherical.phi = Math.max(0.3, Math.min(1.4, spherical.phi + dy * 0.009));
      lastTouch = e.touches[0];
      updateCamera();
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("wheel", onWheel);
    renderer.domElement.addEventListener("touchstart", onTouchStart);
    renderer.domElement.addEventListener("touchmove", onTouchMove);

    // ── Raycaster for click ──
    var raycaster = new THREE.Raycaster();
    var mouse2d = new THREE.Vector2();

    var onClick = function (e) {
      var rect = renderer.domElement.getBoundingClientRect();
      mouse2d.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse2d.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse2d, camera);
      var allObjects = [];
      meshes.forEach(function (m) { m.traverse(function (o) { if (o.isMesh) allObjects.push(o); }); });
      var hits = raycaster.intersectObjects(allObjects);
      if (hits.length > 0) {
        var hit = hits[0].object;
        while (hit.parent && hit.parent !== scene) hit = hit.parent;
    if (hit.userData.index !== undefined) { onSelect(hit.userData.index); setModalOpen(true); }
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    // ── Animation loop ──
    var t = 0;
    var animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      t += 0.016;

      meshes.forEach(function (mesh, i) {
        var isSelected = selectedIndex === i;
        var isExploded = exploded;

        // explode: lift components up and out
        var targetY = isExploded ? 0.5 + i * 0.6 : 0.5;
        var targetScale = isSelected ? 1.15 : 1.0;

        mesh.position.y += (targetY - mesh.position.y) * 0.08;
        mesh.scale.x += (targetScale - mesh.scale.x) * 0.1;
        mesh.scale.y += (targetScale - mesh.scale.y) * 0.1;
        mesh.scale.z += (targetScale - mesh.scale.z) * 0.1;

        // gentle idle rotation on y-axis
        if (!isSelected) {
          mesh.rotation.y += 0.004;
        } else {
          // selected component spins faster and bobs
          mesh.rotation.y += 0.02;
          mesh.position.y = targetY + Math.sin(t * 2.5) * 0.06;
        }

        // rings
        var ring = ringMeshes[i];
        var targetOpacity = isSelected ? 1 : 0;
        ring.material.opacity += (targetOpacity - ring.material.opacity) * 0.12;
        ring.position.y = mesh.position.y - 0.42;
        ring.rotation.z += 0.03;

        // glow lights
        var glow = glowLights[i];
        var targetIntensity = isSelected ? 2.5 : 0.3;
        glow.intensity += (targetIntensity - glow.intensity) * 0.1;
        glow.position.y = mesh.position.y + 1.0;
      });

      renderer.render(scene, camera);
    }

    animate();
    setReady(true);

    // ── Resize handler ──
    var onResize = function () {
      if (!el) return;
      var nW = el.clientWidth;
      var nH = el.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", onResize);

    return function () {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      renderer.domElement.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      setReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, exploded]);

  // ── Sync selected highlight without full rebuild ──
  useEffect(function () {
    // selectedIndex changes are handled inside the animation loop via closure ref
    // we just need the loop to read the latest value — pass via ref
  }, [selectedIndex]);

  function StatBar({ label, value, max, unit }) {
    var pct = Math.min(100, Math.round((value / max) * 100));
    var barColor = pct > 75 ? "#ff6b6b" : pct > 50 ? "#ffd93d" : "#00ff88";
    return (
      <div style={statStyles.row}>
        <div style={statStyles.header}>
          <span style={statStyles.label}>{label}</span>
          <span style={{ ...statStyles.value, color: barColor }}>{value}{unit}</span>
        </div>
        <div style={statStyles.track}>
          <div style={{ ...statStyles.fill, width: pct + "%", background: barColor }} />
        </div>
      </div>
    );
  }

  var isEmpty = !components || components.length === 0;

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.topbar}>
        <span style={styles.topbarDot} />
        {exploded ? "Exploded View — drag to rotate" : "3D Board View — drag to rotate · scroll to zoom"}
      </div>

      {/* Canvas mount */}
      <div
        ref={mountRef}
        style={{
          ...styles.canvas,
          cursor: "grab",
          background: isEmpty ? "var(--bg-0)" : "transparent",
        }}
      >
        {isEmpty && (
          <div style={styles.empty}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <div style={{ color: "#444", fontSize: 12, marginTop: 10 }}>Design a device to see the 3D board</div>
          </div>
        )}
      </div>

      {/* Part info */}
      <div style={styles.partInfo}>
        {selected ? (
          <div style={styles.partSelected}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#" + ACCENT_COLORS[selectedIndex % ACCENT_COLORS.length].toString(16).padStart(6, "0"),
                boxShadow: "0 0 6px #" + ACCENT_COLORS[selectedIndex % ACCENT_COLORS.length].toString(16).padStart(6, "0"),
              }} />
              <span style={styles.partName}>{selected.name}</span>
              <span style={styles.partPrice}>${selected.estimated_price_usd}</span>
            </div>
            <div style={styles.partDesc}>{selected.purpose}</div>
          </div>
        ) : (
          <div style={styles.partHint}>Click a component to inspect it</div>
        )}
      </div>

      {/* Telemetry bars */}
      {stats && (
        <div style={styles.telemetry}>
          <StatBar label="Power Draw" value={stats.power} max={800} unit="mW" />
          <StatBar label="Est. Weight" value={stats.weight} max={300} unit="g" />
          <StatBar label="Feasibility" value={stats.feasibility} max={100} unit="%" />
        </div>
      )}
 {modalOpen && selectedIndex !== null && (
        <HoloModal
          comp={components[selectedIndex]}
          index={selectedIndex}
          onClose={function() { setModalOpen(false); }}
        />
      )}
    </div>
  );
}

var styles = {
  panel: {
    width: 300,
    background: "var(--bg-1)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  topbar: {
    padding: "8px 14px",
    fontSize: 10,
    fontWeight: 600,
    color: "var(--text-3)",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  topbarDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#00ff88",
    boxShadow: "0 0 6px #00ff88",
    display: "inline-block",
  },
  canvas: {
    width: "100%",
    height: 280,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 0,
  },
  partInfo: {
    padding: "10px 14px",
    borderTop: "1px solid var(--border)",
    minHeight: 52,
  },
  partSelected: { display: "flex", flexDirection: "column", gap: 4 },
  partName: { fontSize: 13, fontWeight: 700, color: "var(--text-1)" },
  partPrice: { fontSize: 12, fontWeight: 700, color: "#00ff88", marginLeft: "auto" },
  partDesc: { fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 },
  partHint: { fontSize: 11, color: "var(--text-3)", fontStyle: "italic" },
  telemetry: {
    padding: "10px 14px 14px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
};

var statStyles = {
  row: { display: "flex", flexDirection: "column", gap: 4 },
  header: { display: "flex", justifyContent: "space-between" },
  label: { fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  value: { fontSize: 11, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  track: { height: 3, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 99, transition: "width 0.4s ease" },
};

export default Viewer3D;