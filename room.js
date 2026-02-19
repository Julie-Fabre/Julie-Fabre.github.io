// =============================================================
// INTERACTIVE ROOM CONFIG
// To add a new object:
//   1. Draw it in Inkscape in room.svg
//   2. Set the group's label (Object Properties > Label)
//   3. Add an entry here with that label
// =============================================================
const interactiveObjects = [
  {
    svgLabel: "tintin_fusee",
    url: "tintin_fusee.html",
    tooltip: "Is Tintin's rocket realistic?",
  },
  {
    svgLabel: "open_science_award",
    url: "open-science.html",
    tooltip: "Open science in academia",
  },
  {
    svgLabel: "neuropixels_probe",
    url: "resources.html",
    tooltip: "Neuropixels probe — tiny but mighty!",
  },
  {
    svgLabel: "raw_traces_monitor",
    url: "protocols.html",
    tooltip: "Live Neuropixels recordings",
  },
  {
    svgLabel: "analysis_monitor",
    url: "software.html",
    tooltip: "Neuroscience analysis tools",
  },
  {
    svgLabel: "fermentation",
    url: "tinkering-other.html",
    tooltip: "Kefir & kombucha fermentation",
  },
  {
    svgLabel: "leather_shoes",
    url: "shoemaking.html",
    tooltip: "Handmade leather shoes",
  },
  {
    svgLabel: "leather_handbag",
    url: "shoemaking.html",
    tooltip: "Handmade leather handbag",
  },
  {
    svgLabel: "corticostriatal_frame",
    url: "https://www.nature.com/articles/s41586-020-03166-8",
    tooltip: "Striatal activity topographically reflects cortical activity",
  },
  {
    svgLabel: "poster_basal_ganglia",
    url: "resources.html#basal-ganglia",
    tooltip: "Sensorimotor transformation in basal ganglia",
  },
  {
    svgLabel: "poster_cta",
    url: "resources.html#taste-aversion",
    tooltip: "Conditioned taste aversion neural encoding",
  },
  {
    svgLabel: "bombcell",
    url: "https://github.com/Julie-Fabre/bombcell",
    tooltip: "BombCell — spike sorting quality control",
  },
  {
    svgLabel: "brain_street_view",
    url: "https://github.com/Julie-Fabre/brain_street_view",
    tooltip: "Brain Street View",
  },
  {
    svgLabel: "unitmatch",
    url: "resources.html#unitmatch",
    tooltip: "UnitMatch — cross-session unit tracking",
  },
  {
    svgLabel: "awesome_science_list",
    url: "https://github.com/Julie-Fabre/awesome_science",
    tooltip: "Awesome tools for science & academia",
  },
  {
    svgLabel: "awesome_neuropixels_list",
    url: "https://github.com/Julie-Fabre/awesome_neuropixels",
    tooltip: "Awesome Neuropixels resources",
  },
  {
    svgLabel: "maxou",
    url: "https://m-beau.github.io/",
    tooltip: "Maxou",
  },
];

// =============================================================
// LOGIC — no need to edit below when adding new objects
// =============================================================

document.addEventListener("DOMContentLoaded", function () {
  var container = document.getElementById("room-container");
  var tooltip = document.getElementById("room-tooltip");
  if (!container) return;

  fetch("room.svg")
    .then(function (response) { return response.text(); })
    .then(function (svgText) {
      // Parse the SVG and inject it inline
      var parser = new DOMParser();
      var doc = parser.parseFromString(svgText, "image/svg+xml");
      var svg = doc.querySelector("svg");
      if (!svg) return;

      // Make the SVG fill the full viewport width
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.style.width = "100vw";
      svg.style.height = "auto";
      svg.style.display = "block";
      svg.style.marginLeft = "calc(-50vw + 50%)";
      container.appendChild(svg);

      // Shared state for toggle interactions
      var lampOn = localStorage.getItem('darkMode') !== 'true';
      var curtainsOpen = true;
      var nightSkyGroup = null;
      var daySkyGroup = null;
      function updateWindowScene() {
        if (nightSkyGroup) {
          nightSkyGroup.style.opacity = (!lampOn && curtainsOpen) ? "1" : "0";
        }
        if (daySkyGroup) {
          daySkyGroup.style.opacity = (lampOn && curtainsOpen) ? "1" : "0";
        }
      }

      // Build a lookup of inkscape:label -> element
      var INKSCAPE_NS = "http://www.inkscape.org/namespaces/inkscape";
      var labelMap = {};
      svg.querySelectorAll("g").forEach(function (g) {
        var label = g.getAttributeNS(INKSCAPE_NS, "label");
        if (label) labelMap[label] = g;
      });

      // Wire up each interactive object
      interactiveObjects.forEach(function (obj) {
        var el = labelMap[obj.svgLabel];
        if (!el) {
          console.warn("Room: could not find SVG group with label:", obj.svgLabel);
          return;
        }

        // Wrap in an SVG <a> element for navigation
        var link = document.createElementNS("http://www.w3.org/2000/svg", "a");
        link.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", obj.url);
        link.setAttribute("href", obj.url);
        link.classList.add("interactive-object");

        el.parentNode.insertBefore(link, el);
        link.appendChild(el);

        // Tooltip on hover
        link.addEventListener("mouseenter", function () {
          tooltip.textContent = obj.tooltip;
          tooltip.classList.add("visible");
        });

        link.addEventListener("mouseleave", function () {
          tooltip.classList.remove("visible");
        });

        link.addEventListener("mousemove", function (e) {
          tooltip.style.left = (e.clientX + 12) + "px";
          tooltip.style.top = (e.clientY + 12) + "px";
        });
      });

      // === LAMP TOGGLE ===
      var lamp = labelMap["pendant-lamp"];
      if (lamp) {
        // Create a dark overlay that covers the whole room
        var viewBox = svg.viewBox.baseVal;
        var overlay = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        overlay.setAttribute("x", viewBox.x);
        overlay.setAttribute("y", viewBox.y);
        overlay.setAttribute("width", viewBox.width);
        overlay.setAttribute("height", viewBox.height);
        overlay.setAttribute("id", "lamp-darkness");
        overlay.setAttribute("style",
          "fill:#1a1020;opacity:0;pointer-events:none;transition:opacity 0.6s ease");
        // Insert overlay just before the sunbeams so window light shows through
        var sunbeams = labelMap["sunbeams"];
        if (sunbeams) {
          sunbeams.parentNode.insertBefore(overlay, sunbeams);
        } else {
          svg.appendChild(overlay);
        }

        lamp.style.cursor = "pointer";

        // Elements that dim more when lamp is off (far from window)
        var dimTargets = ["pegboard", "poster_basal_ganglia", "poster_cta",
                          "open_science_award", "fermentation", "right-shelf",
                          "fermentation-shelf-upper"].map(function (label) {
          return labelMap[label];
        }).filter(Boolean);

        // All lamp glow elements
        var glowIds = ["lamp-glow-effect", "lamp-glow-inner", "lamp-light-cone"];

        function applyLampState(animate) {
          var dur = animate ? "0.6s" : "0s";
          // Toggle darkness overlay
          overlay.style.transition = "opacity " + dur + " ease";
          overlay.style.opacity = lampOn ? "0" : "0.55";
          // In dark mode the lamp glows MORE (it's the light source)
          glowIds.forEach(function (id) {
            var el = lamp.querySelector("#" + id);
            if (el) {
              el.style.transition = "opacity " + dur + " ease";
              el.style.opacity = lampOn ? "1" : "1.5";
            }
          });
          // Make the lamp shade glow warm in dark mode
          var shade = lamp.querySelector("#lamp-shade");
          if (shade) {
            shade.style.transition = "filter " + dur + " ease";
            shade.style.filter = lampOn ? "none" : "brightness(1.3) saturate(1.2)";
          }
          // Dim pegboard, posters, shelves, award when lamp is off
          dimTargets.forEach(function (el) {
            el.style.transition = "opacity " + dur + " ease, filter " + dur + " ease";
            el.style.opacity = lampOn ? "1" : "0.65";
            el.style.filter = lampOn ? "none" : "brightness(0.6)";
          });
          // Site-wide dark mode
          if (lampOn) {
            document.body.classList.remove("dark-mode");
          } else {
            document.body.classList.add("dark-mode");
          }
          localStorage.setItem("darkMode", lampOn ? "false" : "true");
          updateWindowScene();
        }

        // Apply saved state immediately (no animation)
        if (!lampOn) applyLampState(false);

        lamp.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          lampOn = !lampOn;
          applyLampState(true);
        });

        // Tooltip for lamp
        lamp.addEventListener("mouseenter", function () {
          tooltip.textContent = lampOn ? "Night mode" : "Day mode";
          tooltip.classList.add("visible");
        });
        lamp.addEventListener("mouseleave", function () {
          tooltip.classList.remove("visible");
        });
        lamp.addEventListener("mousemove", function (e) {
          tooltip.style.left = (e.clientX + 12) + "px";
          tooltip.style.top = (e.clientY + 12) + "px";
        });
      }

      // === CURTAIN TOGGLE ===
      var curtainLeft = svg.querySelector("#curtain-left");
      var curtainRight = svg.querySelector("#curtain-right");

      if (curtainLeft && curtainRight) {
        var windowGroup = curtainLeft.parentNode;

        // Collect all open-state curtain elements
        var openEls = [
          "curtain-left", "curtain-left-fold1", "curtain-left-fold2", "curtain-left-fold3",
          "curtain-right", "curtain-right-fold1", "curtain-right-fold2", "curtain-right-fold3"
        ].map(function (id) { return svg.querySelector("#" + id); }).filter(Boolean);

        openEls.forEach(function (el) {
          el.style.transition = "opacity 0.8s ease";
          el.style.cursor = "pointer";
        });

        // --- Build closed-curtain shapes following the bow window ---
        // Rod curve: M 98,50.5 → 121.7,55 → 181.8,55.4 → 205,50
        // Window bottom: ~107 at edges, ~103 at center (perspective)
        var closedGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        closedGroup.setAttribute("id", "curtains-closed");
        closedGroup.style.opacity = "0";
        closedGroup.style.transition = "opacity 0.8s ease";
        closedGroup.style.pointerEvents = "none";
        closedGroup.style.cursor = "pointer";

        // Left half — follows rod bow at top, window depth at bottom
        var closedL = document.createElementNS("http://www.w3.org/2000/svg", "path");
        closedL.setAttribute("d",
          "M 99,50.5 C 107,52 115,54 121.7,55 C 133,55.1 143,55.2 152,55.3" +
          " L 152,103 C 143,103 133,103 121,103 C 110,104.5 104,106 99,107 Z");
        closedL.setAttribute("style",
          "fill:url(#curtain-gradient);fill-opacity:0.92;stroke:#4a3520;stroke-width:0.3");

        // Right half (mirror)
        var closedR = document.createElementNS("http://www.w3.org/2000/svg", "path");
        closedR.setAttribute("d",
          "M 204,50 C 196,52 189,54 181.8,55.4 C 170,55.35 160,55.3 152,55.3" +
          " L 152,103 C 160,103 170,103 181.8,103 C 193,104.5 199,106 204,107 Z");
        closedR.setAttribute("style",
          "fill:url(#curtain-gradient);fill-opacity:0.92;stroke:#4a3520;stroke-width:0.3");

        // Center seam
        var seam = document.createElementNS("http://www.w3.org/2000/svg", "line");
        seam.setAttribute("x1", "152"); seam.setAttribute("y1", "55.3");
        seam.setAttribute("x2", "152"); seam.setAttribute("y2", "103");
        seam.setAttribute("style", "stroke:#8a6530;stroke-width:0.4;stroke-opacity:0.6");

        closedGroup.appendChild(closedL);
        closedGroup.appendChild(closedR);
        closedGroup.appendChild(seam);

        // Wavy fold lines that follow the bow curvature
        // Interpolate rod y and bottom y for any x
        function rodY(x) {
          if (x <= 121.7) return 50.5 + (x - 98) / (121.7 - 98) * 4.5;
          if (x <= 181.8) return 55 + (x - 121.7) / (181.8 - 121.7) * 0.4;
          return 55.4 + (x - 181.8) / (205 - 181.8) * -5.4;
        }
        function botY(x) {
          if (x <= 152) return 107 - (x - 99) / (152 - 99) * 4;
          return 103 + (x - 152) / (204 - 152) * 4;
        }

        [105, 113, 121, 130, 139, 148, 156, 164, 173, 181, 190, 198].forEach(function (x, i) {
          var ty = rodY(x) + 1;
          var by = botY(x) - 1;
          var m1 = ty + (by - ty) * 0.33;
          var m2 = ty + (by - ty) * 0.67;
          var w = (i % 2 === 0) ? 0.4 : -0.3;
          var fold = document.createElementNS("http://www.w3.org/2000/svg", "path");
          fold.setAttribute("d",
            "M " + x + "," + ty +
            " C " + (x + w) + "," + m1 + " " + (x - w) + "," + m2 + " " + x + "," + by);
          fold.setAttribute("style",
            "fill:none;stroke:#9a7040;stroke-width:0.25;stroke-opacity:" + (0.3 + (i % 3) * 0.05));
          closedGroup.appendChild(fold);
        });

        // Insert closed group before the rod (behind rod & open curtains)
        var rodEl = svg.querySelector("#curtain-rod");
        if (rodEl) {
          windowGroup.insertBefore(closedGroup, rodEl);
        } else {
          windowGroup.appendChild(closedGroup);
        }

        // Sunbeams fade when curtains close
        var sunbeamsForCurtains = labelMap["sunbeams"] || svg.querySelector("#sunbeams");
        if (sunbeamsForCurtains) {
          sunbeamsForCurtains.style.transition = "opacity 0.8s ease";
        }

        function toggleCurtains(e) {
          e.preventDefault();
          e.stopPropagation();
          curtainsOpen = !curtainsOpen;

          if (curtainsOpen) {
            // Open: fade in open curtains, hide closed
            openEls.forEach(function (el) { el.style.opacity = "1"; el.style.pointerEvents = "auto"; });
            closedGroup.style.opacity = "0";
            closedGroup.style.pointerEvents = "none";
            if (sunbeamsForCurtains) sunbeamsForCurtains.style.opacity = "0.7";
          } else {
            // Close: fade out open curtains, show closed bow-shaped curtains
            openEls.forEach(function (el) { el.style.opacity = "0"; el.style.pointerEvents = "none"; });
            closedGroup.style.opacity = "1";
            closedGroup.style.pointerEvents = "auto";
            if (sunbeamsForCurtains) sunbeamsForCurtains.style.opacity = "0";
          }
          updateWindowScene();
        }

        // Click on open curtains to close
        openEls.forEach(function (el) { el.addEventListener("click", toggleCurtains); });
        // Click on closed curtains to open
        closedGroup.addEventListener("click", toggleCurtains);

        // Tooltip
        openEls.concat([closedGroup]).forEach(function (el) {
          el.addEventListener("mouseenter", function () {
            tooltip.textContent = curtainsOpen ? "Close curtains" : "Open curtains";
            tooltip.classList.add("visible");
          });
          el.addEventListener("mouseleave", function () {
            tooltip.classList.remove("visible");
          });
          el.addEventListener("mousemove", function (e) {
            tooltip.style.left = (e.clientX + 12) + "px";
            tooltip.style.top = (e.clientY + 12) + "px";
          });
        });
      }

      // === WINDOW SCENES (day landscape + night sky) ===
      var windowEl = labelMap["window"];
      var darknessOverlay = svg.querySelector("#lamp-darkness");
      if (windowEl) {
        var winGroup = windowEl;
        var winTransform = windowEl.getAttribute("transform") || "";

        // Helper: create an SVG element with attributes, append to parent
        function svgEl(tag, attrs, parent) {
          var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
          for (var k in attrs) el.setAttribute(k, String(attrs[k]));
          (parent || daySkyGroup).appendChild(el);
          return el;
        }

        // Create a clipPath from each individual window PANE shape, so the
        // landscape only shows through the glass — not over mullions or frame.
        var defs = svg.querySelector("defs");
        var clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clip.setAttribute("id", "window-glass-clip");
        var isFrameOutline = true;
        Array.prototype.slice.call(winGroup.childNodes).forEach(function (node) {
          if (node.nodeName === "path") {
            if (isFrameOutline) { isFrameOutline = false; return; } // skip frame
            var s = node.getAttribute("style") || "";
            if (s.indexOf("fill:url(#") !== -1) {
              // Add this pane's shape to the clip (union of all panes)
              var clipPane = document.createElementNS("http://www.w3.org/2000/svg", "path");
              clipPane.setAttribute("d", node.getAttribute("d"));
              clip.appendChild(clipPane);
              // Make the pane translucent so landscape shows through
              node.style.fillOpacity = "0.3";
            }
          }
        });
        if (defs) defs.appendChild(clip);

        // -------------------------------------------------------
        // DAY SCENE — Ghibli-style: behind the glass panes
        // -------------------------------------------------------
        daySkyGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        daySkyGroup.setAttribute("id", "day-scene");
        daySkyGroup.setAttribute("clip-path", "url(#window-glass-clip)");
        daySkyGroup.style.opacity = "1";
        daySkyGroup.style.transition = "opacity 0.8s ease";
        daySkyGroup.style.pointerEvents = "none";

        // -- Warm sky background (fills entire window area) --
        svgEl("rect", { x: 98, y: 48, width: 110, height: 65,
          style: "fill:#d0e8f8;fill-opacity:0.6" });
        // Warmer horizon glow
        svgEl("rect", { x: 98, y: 75, width: 110, height: 35,
          style: "fill:#f0e8c8;fill-opacity:0.3" });

        // -- Golden sun with layered glow --
        svgEl("circle", { cx: 115, cy: 58, r: 14,
          style: "fill:#fff8c0;fill-opacity:0.05" });
        svgEl("circle", { cx: 115, cy: 58, r: 8,
          style: "fill:#fff5a0;fill-opacity:0.1" });
        svgEl("circle", { cx: 115, cy: 58, r: 4,
          style: "fill:#fff8d0;fill-opacity:0.2" });
        svgEl("circle", { cx: 115, cy: 58, r: 2.2,
          style: "fill:#fffde8;fill-opacity:0.92" });

        // -- Ghibli cumulus clouds (round, puffy, warm-edged) --
        function makeCloud(cx, cy, sc) {
          var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          g.setAttribute("transform", "translate(" + cx + "," + cy + ") scale(" + sc + ")");
          // Overlapping puffs
          [[-4, 1.2, 4, 2.2], [-1.5, -0.6, 4.5, 2.8], [2.5, 0.8, 3.5, 2.2],
           [0, 1.2, 4, 1.8], [-2.5, 0.2, 3, 2.2], [3.5, -0.1, 3, 2.4],
           [0.5, -1.2, 3.5, 2]
          ].forEach(function (c) {
            svgEl("ellipse", { cx: c[0], cy: c[1], rx: c[2], ry: c[3],
              style: "fill:white;fill-opacity:0.45" }, g);
          });
          // Warm top highlight
          svgEl("ellipse", { cx: -0.5, cy: -2, rx: 3.5, ry: 1.5,
            style: "fill:#fffae0;fill-opacity:0.3" }, g);
          daySkyGroup.appendChild(g);
        }
        makeCloud(140, 60, 0.7);
        makeCloud(172, 56, 0.9);
        makeCloud(198, 61, 0.55);

        // ===== HILLS (back to front, atmospheric perspective) =====

        // Layer 1: Distant mountains (blue-gray, hazy)
        svgEl("path", { d:
          "M 98,86 C 106,81 112,79 120,77 C 128,75 138,78 150,74" +
          " C 160,71 170,75 180,73 C 190,71 197,74 208,78 L 208,113 L 98,113 Z",
          style: "fill:#b0c8d8;fill-opacity:0.45" });

        // Layer 2: Far hills (cool sage with haze)
        svgEl("path", { d:
          "M 98,92 C 108,86 116,88 128,84 C 138,81 148,85 160,82" +
          " C 172,79 182,82 193,80 C 200,79 205,81 208,84 L 208,113 L 98,113 Z",
          style: "fill:#90b878;fill-opacity:0.6" });

        // Layer 3: Mid hills (warm green, lush)
        svgEl("path", { d:
          "M 98,97 C 108,92 116,93 130,89 C 142,86 152,90 166,87" +
          " C 178,85 188,88 198,86 C 204,85 207,87 208,90 L 208,113 L 98,113 Z",
          style: "fill:#68a848;fill-opacity:0.78" });

        // Layer 4: Near meadow (rich deep green)
        svgEl("path", { d:
          "M 98,103 C 110,97 122,99 138,95 C 152,92 164,95 178,93" +
          " C 190,91 200,93 208,96 L 208,113 L 98,113 Z",
          style: "fill:#488a30;fill-opacity:0.88" });

        // ===== TREES (Ghibli rounded canopies) =====
        function makeTree(x, gy, h, cr) {
          var th = h * 0.38;
          var cy = gy - h + cr;
          // Trunk
          svgEl("line", { x1: x, y1: gy, x2: x + 0.15, y2: gy - th,
            style: "stroke:#5a3e20;stroke-width:" + (cr * 0.18) + ";stroke-linecap:round" });
          // Shadow canopy
          svgEl("ellipse", { cx: x + cr * 0.1, cy: cy + cr * 0.3, rx: cr * 1.05, ry: cr * 0.8,
            style: "fill:#2a5818;fill-opacity:0.5" });
          // Main canopy (3 overlapping blobs)
          svgEl("circle", { cx: x - cr * 0.3, cy: cy + cr * 0.1, r: cr * 0.78,
            style: "fill:#3a7828;fill-opacity:0.88" });
          svgEl("circle", { cx: x + cr * 0.25, cy: cy - cr * 0.08, r: cr * 0.88,
            style: "fill:#48922e;fill-opacity:0.88" });
          svgEl("circle", { cx: x - cr * 0.05, cy: cy - cr * 0.32, r: cr * 0.72,
            style: "fill:#58a838;fill-opacity:0.82" });
          // Bright highlight (sunlit top)
          svgEl("circle", { cx: x + cr * 0.18, cy: cy - cr * 0.48, r: cr * 0.38,
            style: "fill:#78c048;fill-opacity:0.5" });
        }

        // Far trees (small, cool-toned)
        makeTree(120, 85, 5, 2);
        makeTree(155, 82, 4.5, 1.8);
        makeTree(190, 81, 5, 2.2);
        // Mid trees (larger, warmer)
        makeTree(108, 95, 7, 3);
        makeTree(135, 90, 8, 3.5);
        makeTree(162, 88, 7.5, 3.2);
        makeTree(192, 87, 7, 2.8);
        // A small tree cluster
        makeTree(145, 91, 5, 2.2);
        makeTree(148, 90, 6, 2.5);

        // ===== GRASS TEXTURE on foreground meadow =====
        function fgY(x) {
          if (x <= 138) return 103 - (x - 98) / (138 - 98) * 8;
          if (x <= 178) return 95 - (x - 138) / (178 - 138) * 2;
          return 93 + (x - 178) / (208 - 178) * 3;
        }
        for (var gx = 101; gx < 206; gx += 1.8) {
          var gy = fgY(gx);
          var gh = 1.2 + Math.sin(gx * 0.73) * 0.8;
          var lean = Math.sin(gx * 1.1) * 0.35;
          svgEl("line", { x1: gx, y1: gy + 0.5, x2: gx + lean, y2: gy - gh,
            style: "stroke:#4a8830;stroke-width:0.18;stroke-linecap:round;stroke-opacity:0.45" });
        }

        // ===== POPPIES =====
        function makePoppy(px, py, sz) {
          // Curved stem
          svgEl("path", { d:
            "M " + px + "," + py + " C " + (px + 0.2 * sz) + "," + (py + sz * 1.2) +
            " " + (px - 0.15 * sz) + "," + (py + sz * 2) + " " + (px + 0.05) + "," + (py + sz * 2.8),
            style: "fill:none;stroke:#3a6828;stroke-width:" + (sz * 0.22) + ";stroke-linecap:round" });
          if (sz >= 0.6) {
            // Full bloom: 4 overlapping petals with depth
            [[-0.38, -0.08, "#c82818"], [0.38, -0.08, "#d83020"], [0, -0.42, "#e84030"], [0, 0.12, "#b82418"]]
              .forEach(function (p) {
                svgEl("ellipse", {
                  cx: px + p[0] * sz, cy: py + p[1] * sz,
                  rx: sz * 0.48, ry: sz * 0.4,
                  style: "fill:" + p[2] + ";fill-opacity:0.88" });
              });
            // Petal highlights (light streaks toward center)
            svgEl("ellipse", { cx: px + 0.1 * sz, cy: py - 0.3 * sz,
              rx: sz * 0.18, ry: sz * 0.28,
              style: "fill:#f06040;fill-opacity:0.35" });
            // Dark center
            svgEl("circle", { cx: px, cy: py - sz * 0.1, r: sz * 0.2,
              style: "fill:#1a0808;fill-opacity:0.78" });
            // Golden stamens
            svgEl("circle", { cx: px, cy: py - sz * 0.1, r: sz * 0.09,
              style: "fill:#c8a020;fill-opacity:0.65" });
          } else {
            // Distant poppy: small red dot
            svgEl("circle", { cx: px, cy: py, r: sz * 0.45,
              style: "fill:#d42818;fill-opacity:0.8" });
          }
        }

        // Foreground poppies (large, detailed)
        [[106, 101, 1.1], [113, 99, 0.9], [119, 100, 1.15], [126, 98, 0.85],
         [132, 97, 1.0], [139, 95, 0.95], [146, 96, 1.1], [152, 94, 0.85],
         [158, 93, 1.0], [165, 93, 0.9], [171, 93, 1.15], [177, 92, 0.8],
         [183, 93, 1.05], [190, 92, 0.9], [197, 93, 0.85]
        ].forEach(function (p) { makePoppy(p[0], p[1], p[2]); });

        // Mid-distance poppies
        [[110, 94, 0.55], [122, 91, 0.5], [138, 89, 0.55], [155, 88, 0.5],
         [170, 87, 0.55], [185, 88, 0.5], [200, 89, 0.45]
        ].forEach(function (p) { makePoppy(p[0], p[1], p[2]); });

        // Far poppies (tiny dots)
        [[115, 88, 0.3], [132, 85, 0.3], [150, 84, 0.35], [168, 83, 0.3],
         [186, 83, 0.3], [202, 85, 0.25]
        ].forEach(function (p) { makePoppy(p[0], p[1], p[2]); });

        // Insert day scene as the very first child of window group
        // (renders underneath everything: frame, panes, curtains)
        winGroup.insertBefore(daySkyGroup, winGroup.firstChild);

        // -------------------------------------------------------
        // NIGHT SKY — moon + stars (inside window group, clipped to panes)
        // Brighter fills to compensate for the darkness overlay on top.
        // -------------------------------------------------------
        nightSkyGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        nightSkyGroup.setAttribute("id", "night-sky");
        nightSkyGroup.setAttribute("clip-path", "url(#window-glass-clip)");
        nightSkyGroup.style.opacity = "0";
        nightSkyGroup.style.transition = "opacity 0.8s ease";
        nightSkyGroup.style.pointerEvents = "none";

        // Dark sky background (covers pane gradients)
        svgEl("rect", { x: 98, y: 48, width: 110, height: 65,
          style: "fill:#080818;fill-opacity:0.95" }, nightSkyGroup);

        // Helper for night sky
        function nEl(tag, attrs) {
          var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
          for (var k in attrs) el.setAttribute(k, String(attrs[k]));
          nightSkyGroup.appendChild(el);
          return el;
        }

        // Crescent moon (bright white to show through overlay)
        nEl("path", { d: "M 189,59 A 4,4 0 1,1 189,67 A 2.8,4 0 1,0 189,59 Z",
          style: "fill:#ffffff;fill-opacity:1" });
        nEl("circle", { cx: 190.5, cy: 63, r: 8,
          style: "fill:#fffde0;fill-opacity:0.1" });

        // Stars (boosted brightness + slightly larger)
        [[108,58,0.5],[116,62,0.4],[126,60,0.45],[133,57,0.35],
         [145,59,0.5],[155,56,0.4],[163,61,0.35],[175,58,0.45],
         [199,56,0.4],[112,66,0.3],[140,65,0.35],[170,64,0.3],
         [107,78,0.4],[119,86,0.35],[130,80,0.45],[142,92,0.3],
         [155,82,0.4],[165,88,0.35],[178,76,0.45],[190,84,0.3],
         [125,96,0.3],[160,95,0.35],[195,92,0.4],[148,75,0.3]
        ].forEach(function (s, i) {
          nEl("circle", { cx: s[0], cy: s[1], r: s[2],
            style: "fill:#ffffff;fill-opacity:1" });
        });

        // Twinkle stars (4-point, bright)
        [[150,62,1.2],[120,74,1],[180,80,1.1]].forEach(function (s) {
          var cx = s[0], cy = s[1], sz = s[2], q = sz * 0.15;
          nEl("path", { d:
            "M "+cx+","+(cy-sz)+" L "+(cx+q)+","+(cy-q)+" L "+(cx+sz)+","+cy+
            " L "+(cx+q)+","+(cy+q)+" L "+cx+","+(cy+sz)+
            " L "+(cx-q)+","+(cy+q)+" L "+(cx-sz)+","+cy+
            " L "+(cx-q)+","+(cy-q)+" Z",
            style: "fill:#ffffff;fill-opacity:1" });
        });

        // Insert night sky right after day scene (both behind panes)
        winGroup.insertBefore(nightSkyGroup, daySkyGroup.nextSibling);
      }
    });
});
