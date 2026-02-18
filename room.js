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
    svgLabel: "card_catalog",
    url: "https://github.com/Julie-Fabre/awesome_science",
    tooltip: "Awesome tools for science & academia",
  },
  {
    svgLabel: "about_me",
    url: "about.html",
    tooltip: "About me",
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

      // Make the SVG responsive
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.style.width = "100%";
      svg.style.height = "auto";
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
    });
});
