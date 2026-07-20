/* =============================================
   PORTFOLIO - Matias Iglesias
   Main JavaScript - Animations & Interactions
============================================= */

// ─── SPACE BACKGROUND — Nave, Meteoritos, Estrellas ────────────
(function initSpace() {
  const canvas = document.getElementById('playground');
  const ctx = canvas.getContext('2d');

  // ── CONFIG ──
  const CFG = {
    bg: '#020209',
    starCount: 220,
    nebulaCount: 4,
    meteorCount: 50,
    meteorSpeedMin: 0.3,
    meteorSpeedMax: 0.9,
    dodgeRadius: 160,
    dodgeForce: 1.2,
    laserSpeed: 14,
    laserColor: '#00ffcc',
    trailMax: 150,
    trailRate: 3,
    shipSize: 18,
    engineGlow: '#00d4ff',
  };

  let W, H, dpr, pageH;
  let mouse = { x: -9999, y: -9999, px: -9999, py: -9999, angle: 0 };
  let stars = [];
  let nebulae = [];
  let meteors = [];
  let lasers = [];
  let debris = [];
  let sparks = [];
  let trail = [];
  let ripples = [];
  let shipVisible = false;

  function rand(a, b) { return Math.random() * (b - a) + a; }
  function dist(x1, y1, x2, y2) { return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    pageH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, H);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ═══════════════════════════════════════════
  // STARFIELD (3 parallax layers)
  // ═══════════════════════════════════════════

  function createStars() {
    stars = [];
    for (let i = 0; i < CFG.starCount; i++) {
      const layer = Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : 2;
      stars.push({
        x: rand(0, W),
        y: rand(0, H),
        r: layer === 0 ? rand(0.3, 0.8) : layer === 1 ? rand(0.8, 1.4) : rand(1.4, 2.2),
        brightness: rand(0.3, 1),
        twinkleSpeed: rand(0.005, 0.025),
        twinklePhase: rand(0, Math.PI * 2),
        layer: layer,
        // some stars have a color tint
        tint: Math.random() < 0.15
          ? ['#aad4ff', '#ffd4aa', '#ffaaaa', '#aaffdd'][Math.floor(rand(0, 4))]
          : null,
      });
    }
  }

  function drawStars() {
    const scrollY = window.scrollY || 0;
    for (const s of stars) {
      const parallax = [0.02, 0.05, 0.1][s.layer];
      const y = ((s.y - scrollY * parallax) % H + H) % H;
      const twinkle = 0.5 + 0.5 * Math.sin(performance.now() * s.twinkleSpeed + s.twinklePhase);
      const alpha = s.brightness * twinkle;

      if (s.tint) {
        ctx.fillStyle = s.tint;
        ctx.globalAlpha = alpha * 0.8;
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha;
      }

      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fill();

      // Brightest stars get a cross-spike
      if (s.r > 1.6 && alpha > 0.6) {
        ctx.globalAlpha = alpha * 0.25;
        ctx.strokeStyle = s.tint || '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 3, y);
        ctx.lineTo(s.x + s.r * 3, y);
        ctx.moveTo(s.x, y - s.r * 3);
        ctx.lineTo(s.x, y + s.r * 3);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ═══════════════════════════════════════════
  // NEBULAE (soft colored fog patches)
  // ═══════════════════════════════════════════

  function createNebulae() {
    nebulae = [];
    const colors = [
      { r: 30, g: 60, b: 120 },   // deep blue
      { r: 80, g: 20, b: 100 },   // purple
      { r: 15, g: 80, b: 70 },    // teal
      { r: 100, g: 30, b: 50 },   // crimson
    ];
    for (let i = 0; i < CFG.nebulaCount; i++) {
      nebulae.push({
        x: rand(W * 0.1, W * 0.9),
        y: rand(H * 0.1, H * 0.9),
        rx: rand(200, 500),
        ry: rand(150, 400),
        color: colors[i % colors.length],
        rotation: rand(0, Math.PI * 2),
        opacity: rand(0.02, 0.045),
      });
    }
  }

  function drawNebulae() {
    for (const n of nebulae) {
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(n.rotation);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(n.rx, n.ry));
      grad.addColorStop(0, `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${n.opacity})`);
      grad.addColorStop(0.5, `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${n.opacity * 0.4})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.scale(1, n.ry / n.rx);
      ctx.beginPath();
      ctx.arc(0, 0, n.rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ═══════════════════════════════════════════
  // MOONS (two celestial bodies)
  // ═══════════════════════════════════════════

  let moons = [];

  function createMoonObj(x, worldY, radius, shadowSide, tint) {
    const m = { x, worldY, r: radius, shadowSide, tint, craters: [] };
    const craterCount = Math.floor(rand(5, 9));
    for (let i = 0; i < craterCount; i++) {
      const a = rand(0, Math.PI * 2);
      const d = rand(0, m.r * 0.6);
      m.craters.push({
        x: Math.cos(a) * d,
        y: Math.sin(a) * d,
        r: rand(3, m.r * 0.18),
      });
    }
    return m;
  }

  function createCelestials() {
    moons = [
      createMoonObj(W * 0.85, H * 0.3, 48, 'right', { body: ['#e8e4df','#c8c4be','#a8a49e','#787470'], glow: [200, 210, 230] }),
      createMoonObj(W * 0.12, H * 1.8, 36, 'left', { body: ['#e0dce8','#b8b4c4','#9490a4','#686478'], glow: [180, 175, 210] }),
    ];
  }

  function drawMoonBody(m) {
    const scrollY = window.scrollY || 0;
    const parallax = 0.12;
    const screenY = m.worldY - scrollY * parallax;

    if (screenY < -m.r * 4 || screenY > H + m.r * 4) return;

    ctx.save();

    // Moon glow
    const [gr, gg, gb] = m.tint.glow;
    const glow = ctx.createRadialGradient(m.x, screenY, m.r * 0.5, m.x, screenY, m.r * 3);
    glow.addColorStop(0, `rgba(${gr}, ${gg}, ${gb}, 0.08)`);
    glow.addColorStop(0.5, `rgba(${gr}, ${gg}, ${gb}, 0.03)`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(m.x, screenY, m.r * 3, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    const [c0, c1, c2, c3] = m.tint.body;
    const surface = ctx.createRadialGradient(
      m.x - m.r * 0.3, screenY - m.r * 0.3, 0,
      m.x, screenY, m.r
    );
    surface.addColorStop(0, c0);
    surface.addColorStop(0.4, c1);
    surface.addColorStop(0.8, c2);
    surface.addColorStop(1, c3);
    ctx.fillStyle = surface;
    ctx.beginPath();
    ctx.arc(m.x, screenY, m.r, 0, Math.PI * 2);
    ctx.fill();

    // Craters
    ctx.save();
    ctx.beginPath();
    ctx.arc(m.x, screenY, m.r, 0, Math.PI * 2);
    ctx.clip();

    for (const c of m.craters) {
      ctx.beginPath();
      ctx.arc(m.x + c.x, screenY + c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 96, 90, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(m.x + c.x + 1, screenY + c.y + 1, c.r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(80, 76, 70, 0.3)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(m.x + c.x - 0.5, screenY + c.y - 0.5, c.r, Math.PI * 1.1, Math.PI * 1.7);
      ctx.strokeStyle = 'rgba(220, 216, 210, 0.25)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.restore();

    // Terminator shadow (crescent)
    ctx.save();
    ctx.beginPath();
    ctx.arc(m.x, screenY, m.r, 0, Math.PI * 2);
    ctx.clip();
    const shadow = m.shadowSide === 'right'
      ? ctx.createLinearGradient(m.x - m.r, screenY, m.x + m.r, screenY)
      : ctx.createLinearGradient(m.x + m.r, screenY, m.x - m.r, screenY);
    shadow.addColorStop(0, 'transparent');
    shadow.addColorStop(0.55, 'transparent');
    shadow.addColorStop(0.8, 'rgba(5, 5, 15, 0.3)');
    shadow.addColorStop(1, 'rgba(5, 5, 15, 0.65)');
    ctx.fillStyle = shadow;
    ctx.fillRect(m.x - m.r, screenY - m.r, m.r * 2, m.r * 2);
    ctx.restore();

    ctx.restore();
  }

  function drawMoons() {
    for (const m of moons) drawMoonBody(m);
  }

  // ═══════════════════════════════════════════
  // SOUND EFFECTS
  // ═══════════════════════════════════════════

  const sfx = {
    laser: null,
    explosion: null,
    ready: false,
  };

  function initAudio() {
    if (sfx.ready) return;
    sfx.laser = new Audio('assets/sounds/laser.wav');
    sfx.laser.volume = 0.12;
    sfx.explosion = new Audio('assets/sounds/explosion.wav');
    sfx.explosion.volume = 0.08;
    sfx.ready = true;
  }

  function playSound(name) {
    if (!sfx.ready) initAudio();
    const src = sfx[name];
    if (!src) return;
    const clone = src.cloneNode();
    clone.volume = src.volume;
    clone.play().catch(() => {});
  }

  // ═══════════════════════════════════════════
  // 8-BIT PIXEL EXPLOSION (canvas-drawn)
  // ═══════════════════════════════════════════

  const pixelExplosions = [];

  function spawnPixelExplosion(x, y, size) {
    const totalFrames = 10;
    const pixelSize = Math.max(4, Math.floor(size / 12));
    pixelExplosions.push({
      x, y, size, pixelSize,
      frame: 0,
      totalFrames,
      frameDuration: 55, // ms per frame
      lastFrameTime: performance.now(),
    });
  }

  function drawPixelExplosion(exp) {
    const t = exp.frame / exp.totalFrames; // 0 → 1
    const px = exp.pixelSize;
    const cx = exp.x;
    const cy = exp.y;
    const maxR = exp.size * 1.2;

    // 8-bit color palette: white core → yellow → orange → red → dark red → gone
    const colors = [
      '#ffffff',  // white hot core
      '#ffffa0',  // bright yellow
      '#ffdd44',  // yellow
      '#ffaa00',  // orange
      '#ff6600',  // deep orange
      '#ee3300',  // red-orange
      '#cc1100',  // red
      '#880000',  // dark red
    ];

    ctx.save();

    // Draw expanding pixel rings
    const rings = 4;
    for (let ring = 0; ring < rings; ring++) {
      const ringDelay = ring * 0.12;
      const ringT = Math.max(0, Math.min(1, (t - ringDelay) / (1 - ringDelay)));
      if (ringT <= 0) continue;

      const radius = ringT * maxR * (0.3 + ring * 0.25);
      const alpha = Math.max(0, 1 - ringT * 1.1);
      if (alpha <= 0) continue;

      // Pick color based on ring and time
      const colorIdx = Math.min(colors.length - 1, Math.floor((ringT * 0.6 + ring * 0.15) * colors.length));

      ctx.globalAlpha = alpha;

      // Draw pixelated circle for this ring
      const gridR = Math.ceil(radius / px);
      for (let gx = -gridR; gx <= gridR; gx++) {
        for (let gy = -gridR; gy <= gridR; gy++) {
          const d = Math.sqrt(gx * gx + gy * gy) * px;
          const thickness = px * (2.5 - ring * 0.4);

          // Ring shape: only draw pixels near the ring edge
          if (d > radius - thickness && d < radius + thickness * 0.5) {
            // Add some pixel randomness for 8-bit feel
            if (Math.random() > 0.3 + ringT * 0.4) continue;

            // Vary color slightly per pixel
            const ci = Math.min(colors.length - 1, Math.max(0, colorIdx + Math.floor(rand(-1, 2))));
            ctx.fillStyle = colors[ci];
            ctx.fillRect(
              cx + gx * px - px / 2,
              cy + gy * px - px / 2,
              px, px
            );
          }
        }
      }
    }

    // Bright core (shrinks over time)
    const coreSize = Math.max(0, (1 - t * 1.5)) * maxR * 0.35;
    if (coreSize > 0) {
      ctx.globalAlpha = Math.max(0, 1 - t * 1.8);
      const coreGridR = Math.ceil(coreSize / px);
      for (let gx = -coreGridR; gx <= coreGridR; gx++) {
        for (let gy = -coreGridR; gy <= coreGridR; gy++) {
          const d = Math.sqrt(gx * gx + gy * gy) * px;
          if (d < coreSize) {
            const ci = d < coreSize * 0.4 ? 0 : d < coreSize * 0.7 ? 1 : 2;
            ctx.fillStyle = colors[ci];
            ctx.fillRect(
              cx + gx * px - px / 2,
              cy + gy * px - px / 2,
              px, px
            );
          }
        }
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function updatePixelExplosions() {
    const now = performance.now();
    for (let i = pixelExplosions.length - 1; i >= 0; i--) {
      const exp = pixelExplosions[i];
      if (now - exp.lastFrameTime >= exp.frameDuration) {
        exp.frame++;
        exp.lastFrameTime = now;
      }
      if (exp.frame >= exp.totalFrames) {
        pixelExplosions.splice(i, 1);
      }
    }
  }

  // ═══════════════════════════════════════════
  // METEORITES (realistic rocky shapes)
  // ═══════════════════════════════════════════

  const METEOR_TYPES = [
    { name: 'iron',    baseColor: [140, 130, 120], highlight: [180, 170, 155], craterColor: [90, 82, 75] },
    { name: 'rocky',   baseColor: [120, 100, 80],  highlight: [160, 140, 110], craterColor: [75, 60, 45] },
    { name: 'icy',     baseColor: [150, 180, 200], highlight: [200, 220, 240], craterColor: [100, 130, 155] },
    { name: 'carbon',  baseColor: [60, 55, 50],    highlight: [95, 88, 80],    craterColor: [35, 30, 28] },
    { name: 'metallic', baseColor: [160, 155, 170], highlight: [210, 205, 220], craterColor: [110, 105, 115] },
  ];

  class Meteor {
    constructor(fromEdge, zoneY) {
      this.type = METEOR_TYPES[Math.floor(rand(0, METEOR_TYPES.length))];
      this.r = rand(20, 50);
      this.alive = true;
      this.respawnTimer = 0;

      if (fromEdge) {
        const scrollY = window.scrollY || 0;
        const side = Math.floor(rand(0, 4));
        if (side === 0) { this.x = -this.r * 2; this.worldY = rand(scrollY, scrollY + H); }
        else if (side === 1) { this.x = W + this.r * 2; this.worldY = rand(scrollY, scrollY + H); }
        else if (side === 2) { this.x = rand(0, W); this.worldY = scrollY - this.r * 2; }
        else { this.x = rand(0, W); this.worldY = scrollY + H + this.r * 2; }
      } else {
        this.x = rand(this.r * 2, W - this.r * 2);
        // Place across the full page height, or in a specific zone
        if (zoneY !== undefined) {
          this.worldY = rand(zoneY, zoneY + H);
        } else {
          this.worldY = rand(this.r * 2, pageH - this.r * 2);
        }
      }

      this.vx = rand(-CFG.meteorSpeedMax, CFG.meteorSpeedMax);
      this.vy = rand(-CFG.meteorSpeedMax, CFG.meteorSpeedMax);
      if (Math.abs(this.vx) < CFG.meteorSpeedMin) this.vx = CFG.meteorSpeedMin * (this.vx < 0 ? -1 : 1);
      if (Math.abs(this.vy) < CFG.meteorSpeedMin) this.vy = CFG.meteorSpeedMin * (this.vy < 0 ? -1 : 1);

      this.rot = rand(0, Math.PI * 2);
      this.rotSpeed = rand(-0.006, 0.006);

      // Generate rocky silhouette
      this.vertCount = Math.floor(rand(8, 14));
      this.vertices = [];
      for (let i = 0; i < this.vertCount; i++) {
        const a = (i / this.vertCount) * Math.PI * 2;
        const jitter = rand(0.6, 1.0);
        this.vertices.push({ a, d: this.r * jitter });
      }

      // Craters
      this.craters = [];
      const craterCount = Math.floor(rand(2, 5));
      for (let i = 0; i < craterCount; i++) {
        const ca = rand(0, Math.PI * 2);
        const cd = rand(0, this.r * 0.5);
        this.craters.push({
          x: Math.cos(ca) * cd,
          y: Math.sin(ca) * cd,
          r: rand(this.r * 0.08, this.r * 0.2),
        });
      }

      // Surface ridges (lines across)
      this.ridges = [];
      const ridgeCount = Math.floor(rand(1, 4));
      for (let i = 0; i < ridgeCount; i++) {
        const a1 = rand(0, Math.PI * 2);
        const a2 = a1 + rand(0.8, 2.0);
        this.ridges.push({
          x1: Math.cos(a1) * this.r * rand(0.3, 0.7),
          y1: Math.sin(a1) * this.r * rand(0.3, 0.7),
          x2: Math.cos(a2) * this.r * rand(0.3, 0.7),
          y2: Math.sin(a2) * this.r * rand(0.3, 0.7),
        });
      }
    }

    update() {
      if (!this.alive) {
        this.respawnTimer--;
        if (this.respawnTimer <= 0) {
          Object.assign(this, new Meteor(true));
          this.alive = true;
        }
        return;
      }

      this.rot += this.rotSpeed;
      this.x += this.vx;
      this.worldY += this.vy;

      // Wrap horizontally
      if (this.x < -this.r * 3) this.x = W + this.r * 2;
      if (this.x > W + this.r * 3) this.x = -this.r * 2;
      // Wrap vertically across full page
      if (this.worldY < -this.r * 3) this.worldY = pageH + this.r * 2;
      if (this.worldY > pageH + this.r * 3) this.worldY = -this.r * 2;

      // Dodge ship (in screen coordinates)
      const scrollY = window.scrollY || 0;
      const screenY = this.worldY - scrollY;
      if (shipVisible) {
        const d = dist(this.x, screenY, mouse.x, mouse.y);
        if (d < CFG.dodgeRadius && d > 1) {
          const angle = Math.atan2(screenY - mouse.y, this.x - mouse.x);
          const f = (1 - d / CFG.dodgeRadius) * CFG.dodgeForce;
          this.vx += Math.cos(angle) * f;
          this.vy += Math.sin(angle) * f;
        }
      }

      // Speed clamp + friction
      const spd = Math.sqrt(this.vx ** 2 + this.vy ** 2);
      if (spd > CFG.meteorSpeedMax * 4) {
        this.vx = (this.vx / spd) * CFG.meteorSpeedMax * 4;
        this.vy = (this.vy / spd) * CFG.meteorSpeedMax * 4;
      }
      this.vx *= 0.999;
      this.vy *= 0.999;
    }

    draw() {
      if (!this.alive) return;
      const scrollY = window.scrollY || 0;
      const screenY = this.worldY - scrollY;

      // Skip if off-screen
      if (screenY < -this.r * 2 || screenY > H + this.r * 2) return;

      const [br, bg, bb] = this.type.baseColor;
      const [hr, hg, hb] = this.type.highlight;
      const [cr, cg, cb] = this.type.craterColor;

      ctx.save();
      ctx.translate(this.x, screenY);
      ctx.rotate(this.rot);

      // Build path
      ctx.beginPath();
      for (let i = 0; i <= this.vertCount; i++) {
        const v = this.vertices[i % this.vertCount];
        const px = Math.cos(v.a) * v.d;
        const py = Math.sin(v.a) * v.d;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.clip();

      // Base fill with gradient (light from top-left)
      const grad = ctx.createLinearGradient(-this.r, -this.r, this.r, this.r);
      grad.addColorStop(0, `rgb(${hr}, ${hg}, ${hb})`);
      grad.addColorStop(0.5, `rgb(${br}, ${bg}, ${bb})`);
      grad.addColorStop(1, `rgb(${cr}, ${cg}, ${cb})`);
      ctx.fillStyle = grad;
      ctx.fill();

      // Craters (dark circles with slight highlight rim)
      for (const c of this.craters) {
        // Shadow
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.7)`;
        ctx.fill();

        // Highlight rim (top)
        ctx.beginPath();
        ctx.arc(c.x, c.y - c.r * 0.15, c.r * 0.85, Math.PI * 1.2, Math.PI * 1.8);
        ctx.strokeStyle = `rgba(${hr}, ${hg}, ${hb}, 0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Surface ridges
      for (const ridge of this.ridges) {
        ctx.beginPath();
        ctx.moveTo(ridge.x1, ridge.y1);
        ctx.lineTo(ridge.x2, ridge.y2);
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.35)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      ctx.restore();

      // Outline (unclipped)
      const screenY2 = this.worldY - (window.scrollY || 0);
      ctx.save();
      ctx.translate(this.x, screenY2);
      ctx.rotate(this.rot);
      ctx.beginPath();
      for (let i = 0; i <= this.vertCount; i++) {
        const v = this.vertices[i % this.vertCount];
        const px = Math.cos(v.a) * v.d;
        const py = Math.sin(v.a) * v.d;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${hr}, ${hg}, ${hb}, 0.25)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    explode() {
      this.alive = false;
      this.respawnTimer = Math.floor(rand(200, 400));

      const scrollY = window.scrollY || 0;
      const screenY = this.worldY - scrollY;

      // Rocky debris
      const count = Math.floor(rand(8, 16));
      for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2);
        const spd = rand(1, 5);
        debris.push({
          x: this.x, y: screenY,
          vx: Math.cos(a) * spd + this.vx * 0.5,
          vy: Math.sin(a) * spd + this.vy * 0.5,
          r: rand(2, 6),
          rot: rand(0, Math.PI * 2),
          rotSpd: rand(-0.1, 0.1),
          life: 1,
          decay: rand(0.008, 0.02),
          color: this.type.baseColor,
        });
      }

      // Hot sparks
      const sparkCount = Math.floor(rand(15, 30));
      for (let i = 0; i < sparkCount; i++) {
        const a = rand(0, Math.PI * 2);
        const spd = rand(2, 8);
        sparks.push({
          x: this.x, y: screenY,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          r: rand(0.8, 2.5),
          life: 1,
          decay: rand(0.02, 0.05),
          hot: Math.random() < 0.4, // hot = orange/white
        });
      }

      ripples.push(new Ripple(this.x, screenY, [255, 200, 100]));
      spawnPixelExplosion(this.x, screenY, this.r * 2.5);
    }
  }

  // ═══════════════════════════════════════════
  // SPACESHIP CURSOR
  // ═══════════════════════════════════════════

  function drawShip() {
    if (!shipVisible) return;

    // Smooth angle toward travel direction
    const dx = mouse.x - mouse.px;
    const dy = mouse.y - mouse.py;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      const target = Math.atan2(dy, dx);
      // Smooth angle lerp (handle wrapping)
      let diff = target - mouse.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      mouse.angle += diff * 0.15;
    }

    const s = CFG.shipSize;
    const a = mouse.angle;
    const x = mouse.x;
    const y = mouse.y;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);

    // Engine glow (behind ship)
    const engineGrad = ctx.createRadialGradient(-s * 0.6, 0, 0, -s * 0.6, 0, s * 1.2);
    engineGrad.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
    engineGrad.addColorStop(0.4, 'rgba(0, 150, 255, 0.1)');
    engineGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = engineGrad;
    ctx.beginPath();
    ctx.arc(-s * 0.6, 0, s * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Engine flame (animated)
    const flicker = 0.7 + Math.sin(performance.now() * 0.02) * 0.3;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, -s * 0.2);
    ctx.lineTo(-s * (0.9 + flicker * 0.4), 0);
    ctx.lineTo(-s * 0.4, s * 0.2);
    ctx.closePath();
    ctx.fillStyle = `rgba(0, 220, 255, ${0.5 * flicker})`;
    ctx.fill();

    // Inner flame
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.1);
    ctx.lineTo(-s * (0.6 + flicker * 0.25), 0);
    ctx.lineTo(-s * 0.35, s * 0.1);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * flicker})`;
    ctx.fill();

    // Ship body
    ctx.beginPath();
    ctx.moveTo(s, 0);                    // nose
    ctx.lineTo(-s * 0.5, -s * 0.55);    // top-left wing
    ctx.lineTo(-s * 0.3, -s * 0.15);    // inner top
    ctx.lineTo(-s * 0.4, 0);            // back center
    ctx.lineTo(-s * 0.3, s * 0.15);     // inner bottom
    ctx.lineTo(-s * 0.5, s * 0.55);     // bottom-left wing
    ctx.closePath();

    // Hull gradient
    const hullGrad = ctx.createLinearGradient(-s * 0.5, -s * 0.5, s, s * 0.5);
    hullGrad.addColorStop(0, '#2a3a5c');
    hullGrad.addColorStop(0.4, '#4a5a7c');
    hullGrad.addColorStop(0.7, '#3a4a6c');
    hullGrad.addColorStop(1, '#1a2a4c');
    ctx.fillStyle = hullGrad;
    ctx.fill();

    // Hull outline
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Cockpit
    ctx.beginPath();
    ctx.ellipse(s * 0.25, 0, s * 0.18, s * 0.1, 0, 0, Math.PI * 2);
    const cockpitGrad = ctx.createRadialGradient(s * 0.3, -s * 0.03, 0, s * 0.25, 0, s * 0.18);
    cockpitGrad.addColorStop(0, 'rgba(120, 220, 255, 0.7)');
    cockpitGrad.addColorStop(1, 'rgba(30, 100, 180, 0.4)');
    ctx.fillStyle = cockpitGrad;
    ctx.fill();

    // Wing details
    ctx.strokeStyle = 'rgba(80, 150, 220, 0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(s * 0.3, -s * 0.05);
    ctx.lineTo(-s * 0.35, -s * 0.4);
    ctx.moveTo(s * 0.3, s * 0.05);
    ctx.lineTo(-s * 0.35, s * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  // ═══════════════════════════════════════════
  // LASERS
  // ═══════════════════════════════════════════

  class Laser {
    constructor(x, y, angle) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * CFG.laserSpeed;
      this.vy = Math.sin(angle) * CFG.laserSpeed;
      this.life = 1;
      this.trail = [];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= 0.006;

      this.trail.push({ x: this.x, y: this.y, l: 1 });
      if (this.trail.length > 8) this.trail.shift();
      this.trail.forEach(t => t.l -= 0.12);

      if (this.x < -50 || this.x > W + 50 || this.y < -50 || this.y > H + 50) this.life = 0;
    }

    draw() {
      // Trail glow
      for (const t of this.trail) {
        if (t.l <= 0) continue;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 200, ${t.l * 0.3})`;
        ctx.fill();
      }

      // Head
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 220, ${this.life})`;
      ctx.shadowColor = CFG.laserColor;
      ctx.shadowBlur = 15;
      ctx.fill();

      // Elongated line in direction
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 0.6, this.y - this.vy * 0.6);
      ctx.strokeStyle = `rgba(0, 255, 220, ${this.life * 0.8})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowBlur = 0;
    }
  }

  // ═══════════════════════════════════════════
  // ENGINE TRAIL (behind ship)
  // ═══════════════════════════════════════════

  function spawnTrail() {
    if (!shipVisible || mouse.x < 0) return;
    const dx = mouse.x - mouse.px;
    const dy = mouse.y - mouse.py;
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed < 1.5) return;

    const count = Math.min(CFG.trailRate, Math.floor(speed / 5) + 1);
    const backAngle = mouse.angle + Math.PI;

    for (let i = 0; i < count; i++) {
      if (trail.length >= CFG.trailMax) break;
      const offset = rand(-4, 4);
      const bx = mouse.x + Math.cos(backAngle) * CFG.shipSize * 0.5;
      const by = mouse.y + Math.sin(backAngle) * CFG.shipSize * 0.5;
      trail.push({
        x: bx + Math.cos(backAngle + Math.PI / 2) * offset,
        y: by + Math.sin(backAngle + Math.PI / 2) * offset,
        vx: Math.cos(backAngle) * rand(0.5, 1.5) + rand(-0.3, 0.3),
        vy: Math.sin(backAngle) * rand(0.5, 1.5) + rand(-0.3, 0.3),
        r: rand(1, 3),
        life: 1,
        decay: rand(0.015, 0.035),
        type: Math.random() < 0.3 ? 'hot' : 'cool',
      });
    }
  }

  // ═══════════════════════════════════════════
  // RIPPLES
  // ═══════════════════════════════════════════

  class Ripple {
    constructor(x, y, rgb) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxR = rand(120, 220);
      this.speed = rand(2.5, 5);
      this.life = 1;
      this.rgb = rgb || [0, 212, 255];
    }
    update() {
      this.radius += this.speed;
      this.life = 1 - this.radius / this.maxR;
    }
    draw() {
      if (this.life <= 0) return;
      const [r, g, b] = this.rgb;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${this.life * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (this.radius > 20) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${this.life * 0.12})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // ═══════════════════════════════════════════
  // COLLISIONS
  // ═══════════════════════════════════════════

  function checkHits() {
    const scrollY = window.scrollY || 0;
    for (let i = lasers.length - 1; i >= 0; i--) {
      const l = lasers[i];
      for (const m of meteors) {
        if (!m.alive) continue;
        const mScreenY = m.worldY - scrollY;
        if (dist(l.x, l.y, m.x, mScreenY) < m.r + 6) {
          m.explode();
          playSound('explosion');
          l.life = 0;
          break;
        }
      }
    }
  }

  // ═══════════════════════════════════════════
  // MAIN LOOP
  // ═══════════════════════════════════════════

  function init() {
    createStars();
    createNebulae();
    createCelestials();
    meteors = [];
    for (let i = 0; i < CFG.meteorCount; i++) {
      meteors.push(new Meteor(false));
    }
  }

  function animate() {
    ctx.fillStyle = CFG.bg;
    ctx.fillRect(0, 0, W, H);

    // Background layers
    drawNebulae();
    drawStars();
    drawMoons();

    // Update
    meteors.forEach(m => m.update());
    lasers.forEach(l => l.update());
    ripples.forEach(r => r.update());
    spawnTrail();

    // Trail particles
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      p.x += p.vx;
      p.y += p.vy;
      p.r *= 0.985;
      p.life -= p.decay;
      if (p.life <= 0 || p.r < 0.2) trail.splice(i, 1);
    }

    // Debris
    for (let i = debris.length - 1; i >= 0; i--) {
      const d = debris[i];
      d.x += d.vx; d.y += d.vy;
      d.vx *= 0.98; d.vy *= 0.98;
      d.rot += d.rotSpd;
      d.life -= d.decay;
      if (d.life <= 0) debris.splice(i, 1);
    }

    // Sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy;
      s.vx *= 0.96; s.vy *= 0.96;
      s.life -= s.decay;
      if (s.life <= 0) sparks.splice(i, 1);
    }

    lasers = lasers.filter(l => l.life > 0);
    ripples = ripples.filter(r => r.life > 0);
    checkHits();

    // ── Draw ──

    // Ripples
    ripples.forEach(r => r.draw());

    // Meteors
    meteors.forEach(m => m.draw());

    // Debris (rocky chunks)
    for (const d of debris) {
      const [r, g, b] = d.color;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.beginPath();
      // Small irregular shape
      ctx.moveTo(-d.r, -d.r * 0.5);
      ctx.lineTo(d.r * 0.3, -d.r);
      ctx.lineTo(d.r, d.r * 0.3);
      ctx.lineTo(-d.r * 0.2, d.r * 0.8);
      ctx.closePath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${d.life})`;
      ctx.fill();
      ctx.restore();
    }

    // Sparks (hot glowing particles)
    for (const s of sparks) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
      if (s.hot) {
        ctx.fillStyle = `rgba(255, ${Math.floor(180 * s.life)}, ${Math.floor(50 * s.life)}, ${s.life})`;
        ctx.shadowColor = 'rgba(255, 150, 50, 0.5)';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = `rgba(255, ${Math.floor(220 * s.life)}, ${Math.floor(150 * s.life)}, ${s.life * 0.7})`;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 8-bit pixel explosions
    updatePixelExplosions();
    for (const exp of pixelExplosions) drawPixelExplosion(exp);

    // Engine trail
    for (const p of trail) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      if (p.type === 'hot') {
        ctx.fillStyle = `rgba(200, 240, 255, ${p.life * 0.5})`;
      } else {
        ctx.fillStyle = `rgba(0, 180, 255, ${p.life * 0.35})`;
      }
      ctx.fill();
    }

    // Lasers
    lasers.forEach(l => l.draw());

    // Ship (on top of everything)
    drawShip();

    mouse.px = mouse.x;
    mouse.py = mouse.y;

    requestAnimationFrame(animate);
  }

  // ── Events ──

  document.addEventListener('mousemove', (e) => {
    if (!shipVisible) shipVisible = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mousedown', (e) => {
    initAudio(); // Unlock audio on first user interaction
    // Shoot laser from ship nose in ship direction
    if (shipVisible) {
      const noseX = mouse.x + Math.cos(mouse.angle) * CFG.shipSize;
      const noseY = mouse.y + Math.sin(mouse.angle) * CFG.shipSize;
      lasers.push(new Laser(noseX, noseY, mouse.angle));
      // Slight spread
      lasers.push(new Laser(noseX, noseY, mouse.angle + rand(-0.15, 0.15)));
      playSound('laser');
    }
    ripples.push(new Ripple(e.clientX, e.clientY));
  });

  document.addEventListener('touchstart', (e) => {
    initAudio();
    const t = e.touches[0];
    if (!shipVisible) shipVisible = true;
    mouse.x = t.clientX;
    mouse.y = t.clientY;
    lasers.push(new Laser(mouse.x, mouse.y, rand(0, Math.PI * 2)));
    lasers.push(new Laser(mouse.x, mouse.y, rand(0, Math.PI * 2)));
    ripples.push(new Ripple(mouse.x, mouse.y));
    playSound('laser');
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    mouse.x = t.clientX;
    mouse.y = t.clientY;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    mouse.x = -9999; mouse.y = -9999;
    shipVisible = false;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -9999; mouse.y = -9999;
    shipVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    shipVisible = true;
  });

  window.addEventListener('resize', () => {
    resize();
    createStars();
    createNebulae();
    createCelestials();
  });

  resize();
  init();
  animate();
})();


// ─── Typewriter Effect ──────────────────────────────────────────
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  const words = ['Full-Stack', 'Frontend', 'Backend', 'de Software'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      el.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 500;
    }

    setTimeout(type, delay);
  }

  type();
})();


// ─── Scroll Reveal Animations ───────────────────────────────────
(function initReveal() {
  const elements = document.querySelectorAll('[data-reveal]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
})();


// ─── Stat Counter Animation ─────────────────────────────────────
(function initCounters() {
  const stats = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function animateCounter(el, target) {
    let current = 0;
    const step = target / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(interval);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 40);
  }

  stats.forEach(s => observer.observe(s));
})();


// ─── Navbar Scroll Effects ──────────────────────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('.section');
  const toggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');

  // Scroll background
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Active section highlight
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => sectionObserver.observe(s));

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();


// ─── Smooth Scroll ──────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const navHeight = document.getElementById('navbar').offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  });
});


// ─── Project Filters ────────────────────────────────────────────
(function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-card');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projects.forEach(project => {
        if (filter === 'all' || project.dataset.category === filter) {
          project.style.display = '';
          requestAnimationFrame(() => {
            project.style.opacity = '1';
            project.style.transform = 'translateY(0)';
          });
        } else {
          project.style.opacity = '0';
          project.style.transform = 'translateY(20px)';
          setTimeout(() => { project.style.display = 'none'; }, 300);
        }
      });
    });
  });
})();


// ─── Skill Tag Hover Glow ───────────────────────────────────────
document.querySelectorAll('.skill-tag').forEach(tag => {
  tag.addEventListener('mouseenter', function() {
    this.style.setProperty('--glow-opacity', '1');
  });
  tag.addEventListener('mouseleave', function() {
    this.style.setProperty('--glow-opacity', '0');
  });
});
