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
      var lampOn = true;
      var curtainsOpen = true;
      var nightSkyGroup = null;
      function updateNightSky() {
        if (!nightSkyGroup) return;
        var show = !lampOn && curtainsOpen;
        nightSkyGroup.style.opacity = show ? "1" : "0";
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

        lamp.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          lampOn = !lampOn;
          // Toggle darkness overlay
          overlay.style.opacity = lampOn ? "0" : "0.55";
          // In dark mode the lamp glows MORE (it's the light source)
          glowIds.forEach(function (id) {
            var el = lamp.querySelector("#" + id);
            if (el) {
              el.style.transition = "opacity 0.6s ease";
              el.style.opacity = lampOn ? "1" : "1.5";
            }
          });
          // Make the lamp shade glow warm in dark mode
          var shade = lamp.querySelector("#lamp-shade");
          if (shade) {
            shade.style.transition = "filter 0.6s ease";
            shade.style.filter = lampOn ? "none" : "brightness(1.3) saturate(1.2)";
          }
          // Dim pegboard, posters, shelves, award when lamp is off
          dimTargets.forEach(function (el) {
            el.style.transition = "opacity 0.6s ease, filter 0.6s ease";
            el.style.opacity = lampOn ? "1" : "0.65";
            el.style.filter = lampOn ? "none" : "brightness(0.6)";
          });
          updateNightSky();
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
          updateNightSky();
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

      // === NIGHT SKY (moon + stars visible through window in night mode) ===
      // Rendered above the darkness overlay so they stay bright.
      // Uses the window group's transform so coordinates match the window panes.
      var windowEl = labelMap["window"];
      var darknessOverlay = svg.querySelector("#lamp-darkness");
      if (windowEl && darknessOverlay) {
        nightSkyGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        nightSkyGroup.setAttribute("id", "night-sky");
        nightSkyGroup.setAttribute("transform", windowEl.getAttribute("transform") || "");
        nightSkyGroup.style.opacity = "0";
        nightSkyGroup.style.transition = "opacity 0.8s ease";
        nightSkyGroup.style.pointerEvents = "none";

        // Crescent moon
        var moon = document.createElementNS("http://www.w3.org/2000/svg", "path");
        moon.setAttribute("d",
          "M 189,59 A 4,4 0 1,1 189,67 A 2.8,4 0 1,0 189,59 Z");
        moon.setAttribute("style", "fill:#fffde0;fill-opacity:0.9;stroke:none");
        nightSkyGroup.appendChild(moon);

        // Soft moon glow
        var moonGlow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        moonGlow.setAttribute("cx", "190.5");
        moonGlow.setAttribute("cy", "63");
        moonGlow.setAttribute("r", "7");
        moonGlow.setAttribute("style", "fill:#fffde0;fill-opacity:0.06;stroke:none");
        nightSkyGroup.appendChild(moonGlow);

        // Stars — [x, y, radius]
        var stars = [
          // Top panes
          [108, 58, 0.4], [116, 62, 0.3], [126, 60, 0.35], [133, 57, 0.25],
          [145, 59, 0.4], [155, 56, 0.3], [163, 61, 0.25], [175, 58, 0.35],
          [199, 56, 0.3], [112, 66, 0.2], [140, 65, 0.25], [170, 64, 0.2],
          // Bottom panes
          [107, 78, 0.3], [119, 86, 0.25], [130, 80, 0.35], [142, 92, 0.2],
          [155, 82, 0.3], [165, 88, 0.25], [178, 76, 0.35], [190, 84, 0.2],
          [125, 96, 0.2], [160, 95, 0.25], [195, 92, 0.3], [148, 75, 0.2],
        ];

        stars.forEach(function (s, i) {
          var star = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          star.setAttribute("cx", s[0]);
          star.setAttribute("cy", s[1]);
          star.setAttribute("r", s[2]);
          star.setAttribute("style", "fill:#fffde0;fill-opacity:" + (0.6 + (i % 4) * 0.1));
          nightSkyGroup.appendChild(star);
        });

        // A few tiny twinkle stars (4-point star shapes)
        [[150, 62, 1], [120, 74, 0.8], [180, 80, 0.9]].forEach(function (s) {
          var twinkle = document.createElementNS("http://www.w3.org/2000/svg", "path");
          var cx = s[0], cy = s[1], sz = s[2];
          twinkle.setAttribute("d",
            "M " + cx + "," + (cy - sz) +
            " L " + (cx + sz * 0.15) + "," + (cy - sz * 0.15) +
            " L " + (cx + sz) + "," + cy +
            " L " + (cx + sz * 0.15) + "," + (cy + sz * 0.15) +
            " L " + cx + "," + (cy + sz) +
            " L " + (cx - sz * 0.15) + "," + (cy + sz * 0.15) +
            " L " + (cx - sz) + "," + cy +
            " L " + (cx - sz * 0.15) + "," + (cy - sz * 0.15) + " Z");
          twinkle.setAttribute("style", "fill:#fffde0;fill-opacity:0.8;stroke:none");
          nightSkyGroup.appendChild(twinkle);
        });

        // Insert after the darkness overlay (renders on top of it, stays bright)
        darknessOverlay.parentNode.insertBefore(nightSkyGroup, darknessOverlay.nextSibling);
      }
    });
});
