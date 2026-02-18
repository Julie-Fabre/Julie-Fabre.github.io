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
    });
});
