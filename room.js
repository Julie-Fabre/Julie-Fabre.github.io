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
    svgLabel: "poster_basal_ganglia",
    url: "about.html",
    tooltip: "Sensorimotor transformation in basal ganglia",
  },
  {
    svgLabel: "poster_cta",
    url: "about.html",
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
    url: "https://www.nature.com/articles/s41592-024-02440-1",
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

        var lampOn = true;
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
        var curtainsOpen = true;
        var windowGroup = curtainLeft.parentNode;

        // Wrap left curtain elements into a group
        var leftGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        leftGroup.setAttribute("id", "curtain-left-group");
        ["curtain-left", "curtain-left-fold1", "curtain-left-fold2", "curtain-left-fold3"]
          .forEach(function (id) {
            var el = svg.querySelector("#" + id);
            if (el) leftGroup.appendChild(el);
          });

        // Wrap right curtain elements into a group
        var rightGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        rightGroup.setAttribute("id", "curtain-right-group");
        ["curtain-right", "curtain-right-fold1", "curtain-right-fold2", "curtain-right-fold3"]
          .forEach(function (id) {
            var el = svg.querySelector("#" + id);
            if (el) rightGroup.appendChild(el);
          });

        // Create closed-curtain fill panels (fabric covering the window)
        var leftPanel = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        leftPanel.setAttribute("x", "110");
        leftPanel.setAttribute("y", "51");
        leftPanel.setAttribute("width", "42");
        leftPanel.setAttribute("height", "59");
        leftPanel.setAttribute("fill", "url(#curtain-gradient)");
        leftPanel.setAttribute("fill-opacity", "0.88");
        leftPanel.style.opacity = "0";
        leftPanel.style.transition = "opacity 0.8s ease";
        leftPanel.style.pointerEvents = "none";

        var rightPanel = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rightPanel.setAttribute("x", "152");
        rightPanel.setAttribute("y", "50.5");
        rightPanel.setAttribute("width", "41");
        rightPanel.setAttribute("height", "59");
        rightPanel.setAttribute("fill", "url(#curtain-gradient)");
        rightPanel.setAttribute("fill-opacity", "0.88");
        rightPanel.style.opacity = "0";
        rightPanel.style.transition = "opacity 0.8s ease";
        rightPanel.style.pointerEvents = "none";

        // Wavy fold lines on the closed panels for fabric texture
        var panelFolds = document.createElementNS("http://www.w3.org/2000/svg", "g");
        panelFolds.setAttribute("id", "curtain-closed-folds");
        panelFolds.style.opacity = "0";
        panelFolds.style.transition = "opacity 0.8s ease";
        panelFolds.style.pointerEvents = "none";

        [
          "M 118,52 c 0.3,10 -0.3,20 0.2,30 0.3,9 -0.2,19 0,28",
          "M 127,52 c -0.2,11 0.4,21 -0.2,30 -0.3,9 0.3,18 0,27",
          "M 137,52 c 0.3,10 -0.2,20 0.2,29 0.2,10 -0.3,19 0,28",
          "M 148,52 c -0.2,10 0.3,20 -0.1,29 -0.3,10 0.2,18 0.1,27",
          "M 162,52 c 0.2,10 -0.3,20 0.2,29 0.3,9 -0.2,18 0,27",
          "M 173,52 c -0.3,10 0.2,20 -0.2,29 -0.2,9 0.3,18 0.1,27",
          "M 184,52 c 0.2,10 -0.3,20 0.2,29 0.3,9 -0.2,18 0,27"
        ].forEach(function (d) {
          var fold = document.createElementNS("http://www.w3.org/2000/svg", "path");
          fold.setAttribute("d", d);
          fold.setAttribute("style",
            "fill:none;stroke:#9a7040;stroke-width:0.25;stroke-opacity:0.4");
          panelFolds.appendChild(fold);
        });

        // Insert panels behind curtain rod, folds behind panels
        var rodEl = svg.querySelector("#curtain-rod");
        if (rodEl) {
          windowGroup.insertBefore(leftPanel, rodEl);
          windowGroup.insertBefore(rightPanel, rodEl);
          windowGroup.insertBefore(panelFolds, rodEl);
        }

        // Append curtain groups at the end of the window group
        // (window-sill is a sibling, not a child of the window group)
        windowGroup.appendChild(leftGroup);
        windowGroup.appendChild(rightGroup);

        // CSS transitions for smooth sliding
        leftGroup.style.transition = "transform 0.8s ease";
        rightGroup.style.transition = "transform 0.8s ease";
        leftGroup.style.cursor = "pointer";
        rightGroup.style.cursor = "pointer";

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
            // Open: slide curtains back to sides
            leftGroup.style.transform = "";
            rightGroup.style.transform = "";
            leftPanel.style.opacity = "0";
            rightPanel.style.opacity = "0";
            panelFolds.style.opacity = "0";
            leftPanel.style.pointerEvents = "none";
            rightPanel.style.pointerEvents = "none";
            panelFolds.style.pointerEvents = "none";
            if (sunbeamsForCurtains) sunbeamsForCurtains.style.opacity = "0.7";
          } else {
            // Close: slide curtains toward center, show panels
            leftGroup.style.transform = "translateX(42px)";
            rightGroup.style.transform = "translateX(-41px)";
            leftPanel.style.opacity = "1";
            rightPanel.style.opacity = "1";
            panelFolds.style.opacity = "1";
            leftPanel.style.pointerEvents = "auto";
            rightPanel.style.pointerEvents = "auto";
            panelFolds.style.pointerEvents = "auto";
            leftPanel.style.cursor = "pointer";
            rightPanel.style.cursor = "pointer";
            panelFolds.style.cursor = "pointer";
            if (sunbeamsForCurtains) sunbeamsForCurtains.style.opacity = "0";
          }
        }

        leftGroup.addEventListener("click", toggleCurtains);
        rightGroup.addEventListener("click", toggleCurtains);
        leftPanel.addEventListener("click", toggleCurtains);
        rightPanel.addEventListener("click", toggleCurtains);
        panelFolds.addEventListener("click", toggleCurtains);

        // Tooltip for curtains
        [leftGroup, rightGroup, leftPanel, rightPanel].forEach(function (el) {
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
    });
});
