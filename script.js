/* =========================================================
   The Curious Data Lab — interactions
   Plain JS, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- retrieval quality bars (fill when visible) ---------- */
  var bars = document.querySelectorAll(".retrieval-demo__compare .bar");
  if ("IntersectionObserver" in window) {
    var barIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-filled");
          barIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { barIO.observe(b); });
  } else {
    bars.forEach(function (b) { b.classList.add("is-filled"); });
  }

  /* ---------- retrieval demo: animate pipeline steps ---------- */
  var runBtn = document.querySelector(".retrieval-demo__run");
  var steps = document.querySelectorAll(".retrieval-demo__flow .flow-step");
  var queryInput = document.getElementById("retrieval-query");

  function runPipeline() {
    if (!steps.length) return;
    steps.forEach(function (s) { s.classList.remove("is-lit"); });
    if (prefersReduced) {
      steps.forEach(function (s) { s.classList.add("is-lit"); });
      return;
    }
    var i = 0;
    (function lit() {
      if (i > 0) steps[i - 1].classList.remove("is-lit");
      if (i < steps.length) {
        steps[i].classList.add("is-lit");
        i++;
        setTimeout(lit, 520);
      }
    })();
  }

  if (runBtn) runBtn.addEventListener("click", runPipeline);
  if (queryInput) {
    queryInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); runPipeline(); }
    });
  }

  /* ---------- fun fact reveal ---------- */
  var funBtn = document.querySelector(".funfact");
  var funPanel = document.getElementById("funfact-panel");
  if (funBtn && funPanel) {
    funBtn.addEventListener("click", function () {
      var open = funPanel.hasAttribute("hidden");
      if (open) { funPanel.removeAttribute("hidden"); }
      else { funPanel.setAttribute("hidden", ""); }
      funBtn.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- segmentation scatter (generated clusters) ---------- */
  (function buildSegments() {
    var svg = document.querySelector(".segment-svg");
    if (!svg) return;
    var svgNS = "http://www.w3.org/2000/svg";
    // four loose clusters matching the PCA projection layout: [cx, cy, fill, count]
    var clusters = [
      { sel: ".cluster--1", cx: 70,  cy: 80,  fill: "#c6ff3f", n: 16 }, // VIP
      { sel: ".cluster--2", cx: 225, cy: 105, fill: "#ff7a59", n: 18 }, // Loyal but Cooling
      { sel: ".cluster--3", cx: 135, cy: 165, fill: "#3d6bff", n: 15 }, // New
      { sel: ".cluster--4", cx: 95,  cy: 120, fill: "#c879ff", n: 15 }  // Dormant
    ];
    clusters.forEach(function (c) {
      var g = svg.querySelector(c.sel);
      if (!g) return;
      for (var i = 0; i < c.n; i++) {
        var angle = Math.random() * Math.PI * 2;
        var r = Math.random() * 34;
        var cx = c.cx + Math.cos(angle) * r;
        var cy = c.cy + Math.sin(angle) * r;
        var dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("cx", cx.toFixed(1));
        dot.setAttribute("cy", cy.toFixed(1));
        dot.setAttribute("r", (2 + Math.random() * 2.5).toFixed(1));
        dot.setAttribute("fill", c.fill);
        dot.setAttribute("opacity", (0.55 + Math.random() * 0.4).toFixed(2));
        g.appendChild(dot);
      }
    });
  })();

  /* ---------- custom cursor ---------- */
  if (canHover && !prefersReduced) {
    var cursor = document.querySelector(".cursor");
    var cursorLabel = document.querySelector(".cursor-label");
    var mx = 0, my = 0, cx = 0, cy = 0;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (cursorLabel) {
        cursorLabel.style.left = e.clientX + "px";
        cursorLabel.style.top = e.clientY + "px";
      }
    });

    (function loop() {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      if (cursor) cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();

    var interactive = document.querySelectorAll("a, button, input, [data-cursor]");
    interactive.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (cursor) cursor.classList.add("is-active");
        var label = el.getAttribute("data-cursor");
        if (label && cursorLabel) {
          cursorLabel.textContent = label;
          cursorLabel.classList.add("is-visible");
        }
      });
      el.addEventListener("mouseleave", function () {
        if (cursor) cursor.classList.remove("is-active");
        if (cursorLabel) cursorLabel.classList.remove("is-visible");
      });
    });
  }

  /* ---------- hero particle constellation ---------- */
  (function constellation() {
    var canvas = document.querySelector(".hero__canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var points = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mouse = { x: -9999, y: -9999 };
    var running = !prefersReduced;

    function size() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildPoints();
    }

    function buildPoints() {
      // density scales with area, capped for performance
      var count = Math.min(90, Math.floor((w * h) / 16000));
      points = [];
      for (var i = 0; i < count; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        p.x += p.vx; p.y += p.vy;

        // gentle attraction toward cursor
        var dxm = mouse.x - p.x, dym = mouse.y - p.y;
        var dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 160 && dm > 0.1) {
          p.x += (dxm / dm) * 0.25;
          p.y += (dym / dm) * 0.25;
        }

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(198,255,63,0.8)";
        ctx.fill();

        // connect nearby points
        for (var j = i + 1; j < points.length; j++) {
          var q = points[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = dx * dx + dy * dy;
          if (dist < 14000) {
            var alpha = 1 - dist / 14000;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(61,107,255," + (alpha * 0.4).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      if (running) requestAnimationFrame(draw);
    }

    window.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    window.addEventListener("mouseout", function () { mouse.x = -9999; mouse.y = -9999; });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(size, 150);
    });

    // pause when hero is off-screen to save cycles
    if ("IntersectionObserver" in window) {
      var hero = document.querySelector(".hero");
      var vis = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !prefersReduced) {
            if (!running) { running = true; draw(); }
          } else {
            running = false;
          }
        });
      }, { threshold: 0 });
      if (hero) vis.observe(hero);
    }

    size();
    if (!prefersReduced) {
      draw();
    } else {
      // static single frame for reduced motion
      draw = function () {};
      ctx.clearRect(0, 0, w, h);
      for (var k = 0; k < points.length; k++) {
        var pt = points[k];
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(198,255,63,0.6)";
        ctx.fill();
      }
    }
  })();

})();
