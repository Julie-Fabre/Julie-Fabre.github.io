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
    url: "resources.html#current-ongoing-work",
    tooltip: "Current ongoing work",
  },
  {
    svgLabel: "analysis_monitor",
    url: "resources.html#current-ongoing-work",
    tooltip: "Current ongoing work",
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
    url: "leatherwork.html",
    tooltip: "Handmade leather handbag",
  },
  {
    svgLabel: "led_cycling_gloves",
    url: "tinkering-other.html",
    tooltip: "LED cycling gloves",
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

  // Update hint text based on device
  var isTouchHint = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  var hintEl = document.querySelector(".room-hint");
  if (hintEl) {
    if (isTouchHint) {
      hintEl.innerHTML = '<span style="font-size: 19px;">Welcome to my home office!</span><br>This room is full of secrets... tap around to find them';
    } else {
      hintEl.innerHTML = '<span style="font-size: 19px;">Welcome to my home office!</span><br>This room is full of secrets... click around to find them';
    }
  }

  fetch("room.svg")
    .then(function (response) { return response.text(); })
    .then(function (svgText) {
      // Parse the SVG and inject it inline
      var parser = new DOMParser();
      var doc = parser.parseFromString(svgText, "image/svg+xml");
      var svg = doc.querySelector("svg");
      if (!svg) return;

      // Remove loading indicator and show the SVG
      container.innerHTML = "";
      container.classList.add("loaded");

      // Make the SVG fill the full viewport width
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.style.width = "100vw";
      svg.style.height = "auto";
      svg.style.display = "block";
      svg.style.marginLeft = "calc(-50vw + 50%)";
      container.appendChild(svg);

      // Prevent decorative overlays from blocking clicks (survives Inkscape re-saves)
      ["desk-top-surface", "desk-grain", "sunbeams", "dust-motes"].forEach(function (id) {
        var el = svg.querySelector("#" + id);
        if (el) el.style.pointerEvents = "none";
      });

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

      // Mobile detection
      var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      var activeLink = null; // Track which object has tooltip shown (for tap-to-navigate)

      // Helper to position tooltip centered above an element
      function positionTooltipForElement(element) {
        var rect = element.getBoundingClientRect();
        var tooltipRect = tooltip.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var topY = rect.top - 10;

        // Position centered above the element
        tooltip.style.left = Math.max(10, Math.min(centerX - tooltipRect.width / 2, window.innerWidth - tooltipRect.width - 10)) + "px";
        // If too close to top, position below instead
        if (topY - tooltipRect.height < 10) {
          tooltip.style.top = (rect.bottom + 10) + "px";
        } else {
          tooltip.style.top = (topY - tooltipRect.height) + "px";
        }
      }

      // Clear active state (for mobile)
      function clearActiveState() {
        if (activeLink) {
          activeLink.classList.remove("mobile-active");
          activeLink = null;
        }
        tooltip.classList.remove("visible");
      }

      // Tap elsewhere to dismiss (mobile)
      if (isTouchDevice) {
        document.addEventListener("touchstart", function (e) {
          // If tap is outside any interactive object, clear the active state
          if (!e.target.closest(".interactive-object")) {
            clearActiveState();
          }
        });
      }

      // Wire up each interactive object
      interactiveObjects.forEach(function (obj) {
        var el = labelMap[obj.svgLabel];
        if (!el) {
          console.warn("Room: could not find SVG group with label:", obj.svgLabel);
          return;
        }

        // Wrap in an SVG <a> element for navigation
        var isExternal = obj.url.indexOf("http") === 0;
        var link = document.createElementNS("http://www.w3.org/2000/svg", "a");
        link.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", obj.url);
        link.setAttribute("href", obj.url);
        if (isExternal) link.setAttribute("target", "_blank");
        link.classList.add("interactive-object");

        el.parentNode.insertBefore(link, el);
        link.appendChild(el);

        if (isTouchDevice) {
          // Mobile: tap-to-show-tooltip, tap-again-to-navigate
          link.addEventListener("touchstart", function (e) {
            if (activeLink === link) {
              // Second tap on same object - allow navigation (don't prevent default)
              return;
            }

            // First tap - show tooltip, prevent navigation
            e.preventDefault();
            clearActiveState();

            activeLink = link;
            link.classList.add("mobile-active");
            tooltip.textContent = obj.tooltip;
            tooltip.classList.add("visible");

            // Position tooltip after it's visible (so we can measure it)
            requestAnimationFrame(function () {
              positionTooltipForElement(link);
            });
          });

          // Prevent click navigation on first tap (touchstart already handled it)
          link.addEventListener("click", function (e) {
            if (activeLink !== link) {
              e.preventDefault();
            }
          });
        } else {
          // Desktop: hover behavior
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
        }
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
                          "fermentation-shelf-upper", "corticostriatal_frame"].map(function (label) {
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
          // Make sunbeams lighter (less visible) in night mode
          var sunbeamsEl = labelMap["sunbeams"];
          if (sunbeamsEl) {
            sunbeamsEl.style.transition = "opacity " + dur + " ease";
            sunbeamsEl.style.opacity = lampOn ? "0.7" : "0.25";
          }
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
            // Use dimmer sunbeams in night mode
            if (sunbeamsForCurtains) sunbeamsForCurtains.style.opacity = lampOn ? "0.7" : "0.25";
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

      // === DESK DRAWER ===
      var drawerClosed = svg.querySelector("#desk-drawer-closed");
      var drawerOpen = svg.querySelector("#desk-drawer-open");
      var oldPaper = svg.querySelector("#old-paper");
      var drawerIsOpen = false;

      if (drawerClosed && drawerOpen) {
        drawerClosed.style.cursor = "pointer";
        drawerClosed.style.transition = "opacity 0.3s ease";
        drawerOpen.style.transition = "opacity 0.3s ease";
        drawerOpen.style.pointerEvents = "none";

        function toggleDrawer(e) {
          e.preventDefault();
          e.stopPropagation();
          drawerIsOpen = !drawerIsOpen;

          if (drawerIsOpen) {
            drawerClosed.style.opacity = "0";
            drawerClosed.style.pointerEvents = "none";
            drawerOpen.style.opacity = "1";
            drawerOpen.style.pointerEvents = "auto";
          } else {
            drawerClosed.style.opacity = "1";
            drawerClosed.style.pointerEvents = "auto";
            drawerOpen.style.opacity = "0";
            drawerOpen.style.pointerEvents = "none";
          }
        }

        drawerClosed.addEventListener("click", toggleDrawer);
        // Click on drawer front (not paper) to close
        var drawerFront = svg.querySelector("#drawer-front-open");
        if (drawerFront) {
          drawerFront.style.cursor = "pointer";
          drawerFront.addEventListener("click", toggleDrawer);
        }

        // Tooltip for drawer
        drawerClosed.addEventListener("mouseenter", function () {
          tooltip.textContent = "Open drawer";
          tooltip.classList.add("visible");
        });
        drawerClosed.addEventListener("mouseleave", function () {
          tooltip.classList.remove("visible");
        });
        drawerClosed.addEventListener("mousemove", function (e) {
          tooltip.style.left = (e.clientX + 12) + "px";
          tooltip.style.top = (e.clientY + 12) + "px";
        });

        // Old paper is clickable - links to old-paper.html
        if (oldPaper) {
          oldPaper.style.cursor = "pointer";
          oldPaper.addEventListener("click", function (e) {
            e.stopPropagation();
            window.location.href = "old-paper.html";
          });
          oldPaper.addEventListener("mouseenter", function () {
            tooltip.textContent = "An old paper... what could it be?";
            tooltip.classList.add("visible");
          });
          oldPaper.addEventListener("mouseleave", function () {
            tooltip.classList.remove("visible");
          });
          oldPaper.addEventListener("mousemove", function (e) {
            tooltip.style.left = (e.clientX + 12) + "px";
            tooltip.style.top = (e.clientY + 12) + "px";
          });
        }
      }

      // === LOOSE FLOOR PLANK & MOUSE ===
      var loosePlank = svg.querySelector("#loose-plank");
      var plankGap = svg.querySelector("#plank-gap");
      var mousePeek = svg.querySelector("#mouse-peek");
      var floorMouse = svg.querySelector("#floor-mouse");
      var plankTilted = false;
      var mouseState = "hidden"; // hidden → peeking → emerged → scurried

      if (loosePlank && plankGap && mousePeek && floorMouse) {
        // Set up tilt animation on the plank
        loosePlank.style.transformBox = "fill-box";
        loosePlank.style.transformOrigin = "center top";
        loosePlank.style.transition = "transform 0.4s ease";
        loosePlank.style.cursor = "pointer";

        plankGap.style.transition = "opacity 0.3s ease";
        mousePeek.style.transition = "opacity 0.3s ease";
        floorMouse.style.transition = "opacity 0.4s ease, transform 0.6s ease";

        function togglePlank(e) {
          e.preventDefault();
          e.stopPropagation();
          plankTilted = !plankTilted;

          if (plankTilted) {
            // Tilt the plank (hinge at far edge, near edge lifts)
            loosePlank.style.transform = "rotate(-12deg)";
            plankGap.style.opacity = "1";
            // Show cute mouse head peeking after a short delay
            if (mouseState === "hidden") {
              mouseState = "peeking";
              setTimeout(function () {
                mousePeek.style.opacity = "1";
                mousePeek.style.pointerEvents = "auto";
              }, 300);
            }
          } else {
            // Un-tilt the plank
            loosePlank.style.transform = "rotate(0deg)";
            plankGap.style.opacity = "0";
            if (mouseState === "peeking") {
              mousePeek.style.opacity = "0";
              mousePeek.style.pointerEvents = "none";
              mouseState = "hidden";
            }
            tooltip.classList.remove("visible");
          }
        }

        loosePlank.addEventListener("click", togglePlank);

        // Tooltip for plank
        loosePlank.addEventListener("mouseenter", function () {
          tooltip.textContent = plankTilted ? "Put it back" : "This plank looks loose...";
          tooltip.classList.add("visible");
        });
        loosePlank.addEventListener("mouseleave", function () {
          tooltip.classList.remove("visible");
        });
        loosePlank.addEventListener("mousemove", function (e) {
          tooltip.style.left = (e.clientX + 12) + "px";
          tooltip.style.top = (e.clientY + 12) + "px";
        });

        // Mouse peek interaction — click to make it come out!
        mousePeek.style.cursor = "pointer";
        mousePeek.addEventListener("click", function (e) {
          e.stopPropagation();
          if (mouseState === "peeking") {
            mouseState = "emerged";
            // Hide the peeking head
            mousePeek.style.opacity = "0";
            mousePeek.style.pointerEvents = "none";
            // Show the full mouse
            floorMouse.style.opacity = "1";
            floorMouse.style.pointerEvents = "auto";
            floorMouse.style.cursor = "pointer";
          }
        });

        mousePeek.addEventListener("mouseenter", function () {
          if (mouseState === "peeking") {
            tooltip.textContent = "A little mouse! Click to say hello";
            tooltip.classList.add("visible");
          }
        });
        mousePeek.addEventListener("mouseleave", function () {
          tooltip.classList.remove("visible");
        });
        mousePeek.addEventListener("mousemove", function (e) {
          tooltip.style.left = (e.clientX + 12) + "px";
          tooltip.style.top = (e.clientY + 12) + "px";
        });

        // Full mouse interaction — click and it scurries away!
        floorMouse.addEventListener("click", function (e) {
          e.stopPropagation();
          if (mouseState === "emerged") {
            mouseState = "scurried";
            tooltip.textContent = "Squeak!";
            tooltip.classList.add("visible");
            // Scurry animation — runs to the left
            floorMouse.style.transform = "translate(-60px, 10px) scale(0.3)";
            floorMouse.style.opacity = "0";
            setTimeout(function () {
              tooltip.classList.remove("visible");
              floorMouse.style.pointerEvents = "none";
            }, 700);
          }
        });

        floorMouse.addEventListener("mouseenter", function () {
          if (mouseState === "emerged") {
            tooltip.textContent = "A little mouse!";
            tooltip.classList.add("visible");
          }
        });
        floorMouse.addEventListener("mouseleave", function () {
          tooltip.classList.remove("visible");
        });
        floorMouse.addEventListener("mousemove", function (e) {
          tooltip.style.left = (e.clientX + 12) + "px";
          tooltip.style.top = (e.clientY + 12) + "px";
        });
      }

      // === SECRET FLOOR KNOT COMBO ===
      // Knots must render AFTER all furniture so they receive clicks
      // (SVG event order = last painted = first to receive events)
      var floorPlanksEl = svg.querySelector("#floor-planks");
      if (floorPlanksEl) {
        var svgNS_k = "http://www.w3.org/2000/svg";
        var knotLayer = document.createElementNS(svgNS_k, "g");
        knotLayer.setAttribute("id", "floor-knots");
        // Same transform as floor-planks so coordinates match
        knotLayer.setAttribute("transform",
          floorPlanksEl.getAttribute("transform") || "");
        svg.appendChild(knotLayer); // appended last = on top for events

        // 4 wood knots centered on planks (gap lines at y=129 computed from
        // vanishing point 149.3,89 → each bottom x at y=170)
        // Plank centers at y=129: 82.5, 91.5, 100, 108.5, 117.5, 126, 134.5,
        //   143, 151.5, 160, 168.5, 177.5, 186.5, 195, 203.5, 212.5
        // Avoiding loose plank area (~x=125-135)
        var knotPositions = [
          { x: 91, y: 129 },
          { x: 151, y: 129 },
          { x: 177, y: 129 },
          { x: 204, y: 129 }
        ];
        var secretSequence = [2, 0, 3, 1]; // correct click order
        var secretPos = 0;
        var knotEls = [];
        var diaryRevealed = localStorage.getItem("diaryFound") === "true";

        knotPositions.forEach(function (pos, i) {
          // Inner ring (wood knot detail)
          var ring = document.createElementNS(svgNS_k, "ellipse");
          ring.setAttribute("cx", pos.x);
          ring.setAttribute("cy", pos.y);
          ring.setAttribute("rx", "1");
          ring.setAttribute("ry", "0.7");
          ring.style.fill = "none";
          ring.style.stroke = "#3a2008";
          ring.style.strokeWidth = "0.2";
          ring.style.strokeOpacity = "0.4";
          ring.style.pointerEvents = "none";
          knotLayer.appendChild(ring);

          // Knot (clickable) — DEBUG: bright red, cursor pointer
          var knot = document.createElementNS(svgNS_k, "ellipse");
          knot.setAttribute("cx", pos.x);
          knot.setAttribute("cy", pos.y);
          knot.setAttribute("rx", "3");
          knot.setAttribute("ry", "2");
          knot.style.fill = "red";
          knot.style.fillOpacity = "0.8";
          knot.style.stroke = "red";
          knot.style.strokeWidth = "0.5";
          knot.style.strokeOpacity = "1";
          knot.style.cursor = "pointer";
          knot.style.transition = "fill 0.3s ease, fill-opacity 0.3s ease";
          knotLayer.appendChild(knot);

          knot.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (diaryRevealed) return;

            if (secretSequence[secretPos] === i) {
              // Correct — turn green
              knot.style.fill = "#00cc44";
              knot.style.fillOpacity = "0.9";
              setTimeout(function () {
                knot.style.fill = "red";
                knot.style.fillOpacity = "0.8";
              }, 500);

              secretPos++;
              if (secretPos === secretSequence.length) {
                diaryRevealed = true;
                localStorage.setItem("diaryFound", "true");
                revealDiary();
              }
            } else {
              // Wrong — brief white flash then reset
              knot.style.fill = "white";
              setTimeout(function () {
                knot.style.fill = "red";
              }, 200);
              secretPos = 0;
            }
          });
          knotEls.push(knot);
        });

        // Tiny diary book that appears near the loose plank
        function revealDiary() {
          var g = document.createElementNS(svgNS_k, "g");
          g.setAttribute("id", "secret-diary");
          // Use loose-plank-group transform so it sits on the floor
          var plankGroupEl = svg.querySelector("#loose-plank-group");
          g.setAttribute("transform",
            plankGroupEl ? plankGroupEl.getAttribute("transform") || "" : "");
          g.style.cursor = "pointer";

          // Book cover
          var cover = document.createElementNS(svgNS_k, "rect");
          cover.setAttribute("x", "126");
          cover.setAttribute("y", "128");
          cover.setAttribute("width", "4.5");
          cover.setAttribute("height", "6");
          cover.setAttribute("rx", "0.3");
          cover.setAttribute("style", "fill:#8a4a30;stroke:#5a2a18;stroke-width:0.25");
          g.appendChild(cover);
          // Spine
          var spine = document.createElementNS(svgNS_k, "line");
          spine.setAttribute("x1", "126.6");
          spine.setAttribute("y1", "128.3");
          spine.setAttribute("x2", "126.6");
          spine.setAttribute("y2", "133.7");
          spine.setAttribute("style", "stroke:#5a2a18;stroke-width:0.2;stroke-opacity:0.5");
          g.appendChild(spine);
          // Pages edge
          var pages = document.createElementNS(svgNS_k, "rect");
          pages.setAttribute("x", "127");
          pages.setAttribute("y", "128.4");
          pages.setAttribute("width", "3.2");
          pages.setAttribute("height", "5.2");
          pages.setAttribute("rx", "0.15");
          pages.setAttribute("style", "fill:#f0e8d0;stroke:none;fill-opacity:0.5");
          g.appendChild(pages);
          // Tiny paw print on cover
          var paw = document.createElementNS(svgNS_k, "circle");
          paw.setAttribute("cx", "128.3");
          paw.setAttribute("cy", "130.5");
          paw.setAttribute("r", "0.5");
          paw.setAttribute("style", "fill:#5a2a18;fill-opacity:0.35");
          g.appendChild(paw);
          // Toe beans
          [[127.7, 129.9], [128.3, 129.6], [128.9, 129.9]].forEach(function (b) {
            var bean = document.createElementNS(svgNS_k, "circle");
            bean.setAttribute("cx", b[0]);
            bean.setAttribute("cy", b[1]);
            bean.setAttribute("r", "0.25");
            bean.setAttribute("style", "fill:#5a2a18;fill-opacity:0.3");
            g.appendChild(bean);
          });

          // Append to SVG root (on top of everything for visibility & clicks)
          svg.appendChild(g);

          // Fade in
          g.style.opacity = "0";
          g.style.transition = "opacity 0.8s ease";
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { g.style.opacity = "1"; });
          });

          // Click to navigate
          g.addEventListener("click", function (e) {
            e.stopPropagation();
            window.location.href = "mouse-diary.html";
          });
          // Tooltip
          g.addEventListener("mouseenter", function () {
            tooltip.textContent = "A tiny diary with paw prints...";
            tooltip.classList.add("visible");
          });
          g.addEventListener("mouseleave", function () {
            tooltip.classList.remove("visible");
          });
          g.addEventListener("mousemove", function (e) {
            tooltip.style.left = (e.clientX + 12) + "px";
            tooltip.style.top = (e.clientY + 12) + "px";
          });
        }

        // If already found, show diary immediately
        if (diaryRevealed) revealDiary();
      }

      // === WALL CLOCK (real time) ===
      var clockHour = svg.querySelector("#clock-hour");
      var clockMinute = svg.querySelector("#clock-minute");
      var clockSecond = svg.querySelector("#clock-second");
      if (clockHour && clockMinute && clockSecond) {
        var clockCX = 265, clockCY = 60;
        function updateClock() {
          var now = new Date();
          var h = now.getHours() % 12;
          var m = now.getMinutes();
          var s = now.getSeconds();
          var hourAngle = (h + m / 60) * 30;
          var minuteAngle = (m + s / 60) * 6;
          var secondAngle = s * 6;
          clockHour.setAttribute("transform", "rotate(" + hourAngle + "," + clockCX + "," + clockCY + ")");
          clockMinute.setAttribute("transform", "rotate(" + minuteAngle + "," + clockCX + "," + clockCY + ")");
          clockSecond.setAttribute("transform", "rotate(" + secondAngle + "," + clockCX + "," + clockCY + ")");
        }
        updateClock();
        setInterval(updateClock, 1000);

        // Tooltip for the clock
        var clockGroup = svg.querySelector("#wall-clock-group");
        if (clockGroup) {
          clockGroup.style.cursor = "pointer";
          clockGroup.addEventListener("mouseenter", function () {
            var now = new Date();
            var h = now.getHours();
            var m = now.getMinutes();
            var ampm = h >= 12 ? "pm" : "am";
            var h12 = h % 12 || 12;
            var mStr = m < 10 ? "0" + m : m;
            tooltip.textContent = h12 + ":" + mStr + " " + ampm + " — your local time";
            tooltip.classList.add("visible");
          });
          clockGroup.addEventListener("mouseleave", function () {
            tooltip.classList.remove("visible");
          });
          clockGroup.addEventListener("mousemove", function (e) {
            tooltip.style.left = (e.clientX + 12) + "px";
            tooltip.style.top = (e.clientY + 12) + "px";
          });
        }
      }

      // === COFFEE MUG (click to drink) ===
      var coffeeMug = svg.querySelector("#coffee-mug");
      if (coffeeMug) {
        var mugCoffee = svg.querySelector("#mug-coffee");
        var coffeeShine = svg.querySelector("#coffee-shine");
        var steamEls = [svg.querySelector("#steam1"), svg.querySelector("#steam2"), svg.querySelector("#steam3")];
        var coffeeDrunk = false;

        coffeeMug.style.cursor = "pointer";

        coffeeMug.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (!coffeeDrunk) {
            coffeeDrunk = true;
            // Drink the coffee — liquid fades away
            if (mugCoffee) {
              mugCoffee.style.transition = "opacity 0.6s ease";
              mugCoffee.style.opacity = "0";
            }
            if (coffeeShine) {
              coffeeShine.style.transition = "opacity 0.4s ease";
              coffeeShine.style.opacity = "0";
            }
            // Steam stops
            steamEls.forEach(function (s) {
              if (s) {
                s.style.transition = "opacity 0.5s ease";
                s.style.opacity = "0";
                // Pause animations
                s.querySelectorAll("animate, animateTransform").forEach(function (a) {
                  a.setAttribute("repeatCount", "0");
                });
              }
            });
            // Show empty mug interior
            var mugInside = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            mugInside.setAttribute("cx", "198");
            mugInside.setAttribute("cy", "103.5");
            mugInside.setAttribute("rx", "1.8");
            mugInside.setAttribute("ry", "0.45");
            mugInside.setAttribute("style", "fill:#e8dcc8;stroke:none;opacity:0");
            coffeeMug.insertBefore(mugInside, mugCoffee);
            setTimeout(function () { mugInside.style.transition = "opacity 0.6s ease"; mugInside.style.opacity = "1"; }, 300);

            tooltip.textContent = "Ahh, that's better!";
            tooltip.classList.add("visible");
            setTimeout(function () { tooltip.classList.remove("visible"); }, 1500);
          } else {
            // Refill!
            coffeeDrunk = false;
            if (mugCoffee) {
              mugCoffee.style.opacity = "1";
            }
            if (coffeeShine) {
              coffeeShine.style.opacity = "0.5";
            }
            // Remove the empty interior
            var emptyInside = coffeeMug.querySelector("ellipse[cx='198'][ry='0.45']");
            if (emptyInside) coffeeMug.removeChild(emptyInside);
            // Restart steam
            steamEls.forEach(function (s) {
              if (s) {
                s.style.opacity = "";
                s.querySelectorAll("animate, animateTransform").forEach(function (a) {
                  a.setAttribute("repeatCount", "indefinite");
                });
              }
            });
            tooltip.textContent = "Refilled!";
            tooltip.classList.add("visible");
            setTimeout(function () { tooltip.classList.remove("visible"); }, 1200);
          }
        });

        coffeeMug.addEventListener("mouseenter", function () {
          tooltip.textContent = coffeeDrunk ? "Empty... click to refill" : "Click for a coffee break!";
          tooltip.classList.add("visible");
        });
        coffeeMug.addEventListener("mouseleave", function () {
          tooltip.classList.remove("visible");
        });
        coffeeMug.addEventListener("mousemove", function (e) {
          tooltip.style.left = (e.clientX + 12) + "px";
          tooltip.style.top = (e.clientY + 12) + "px";
        });
      }

      // === PHILODENDRON PLANT (click to water & grow) ===
      var plantJar = svg.querySelector("#jar");
      if (plantJar) {
        var svgNS = "http://www.w3.org/2000/svg";
        var foliageIds = [
          "philo-stem1", "philo-stem2", "philo-stem3", "philo-stem4", "philo-stem5",
          "philo-leaf1", "philo-leaf1-pink", "philo-vein1",
          "philo-leaf2", "philo-leaf2-pink1", "philo-leaf2-pink2", "philo-vein2",
          "philo-leaf3", "philo-leaf3-pink",
          "philo-leaf4", "philo-leaf4-pink",
          "philo-leaf5-pink", "philo-leaf5-green", "philo-vein5"
        ];
        var foliageEls = foliageIds.map(function (id) { return svg.querySelector("#" + id); }).filter(Boolean);
        var plantJarRim = svg.querySelector("#jar-rim");

        // Wrap everything in a clickable group
        var plantGroup = document.createElementNS(svgNS, "g");
        plantGroup.setAttribute("id", "plant-interactive");
        plantGroup.style.cursor = "pointer";
        plantJar.parentNode.insertBefore(plantGroup, plantJar);
        plantGroup.appendChild(plantJar);
        if (plantJarRim) plantGroup.appendChild(plantJarRim);

        // Foliage wrapper (gets scaled for growth)
        var foliageWrapper = document.createElementNS(svgNS, "g");
        foliageWrapper.setAttribute("id", "plant-foliage");
        plantGroup.appendChild(foliageWrapper);
        foliageEls.forEach(function (el) { foliageWrapper.appendChild(el); });

        // Growth + pot state
        var maxGrowth = 5;
        var plantGrowth = parseInt(localStorage.getItem("plantGrowth") || "0");
        var potLevel = parseInt(localStorage.getItem("plantPot") || "0");
        var maxPot = 1;
        var growX = 233.5, growY = 76; // jar rim center (scale origin)

        function getTargetScale() {
          if (potLevel === 0) return 1 + plantGrowth * 0.1;
          return 1.5 + plantGrowth * 0.06;
        }

        var currentPlantScale = getTargetScale();

        function setPlantScale(s) {
          var tx = growX * (1 - s);
          var ty = growY * (1 - s);
          foliageWrapper.setAttribute("transform",
            "translate(" + tx + "," + ty + ") scale(" + s + ")");
          currentPlantScale = s;
        }

        function animatePlantGrowth(toScale) {
          var fromScale = currentPlantScale;
          var start = null;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / 1000, 1);
            p = 1 - Math.pow(1 - p, 3); // ease-out cubic
            setPlantScale(fromScale + (toScale - fromScale) * p);
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }

        // Bigger terracotta pot (created on re-pot)
        var bigPotEls = [];
        function createBigPot() {
          var potBody = document.createElementNS(svgNS, "path");
          potBody.setAttribute("d",
            "M 231.2,75.5 L 230.5,80.3 Q 230.5,81.3 233.5,81.3 Q 236.5,81.3 236.5,80.3 L 235.8,75.5 Z");
          potBody.setAttribute("style", "fill:#c4713a;stroke:#8a4a20;stroke-width:0.3");
          var potRim = document.createElementNS(svgNS, "ellipse");
          potRim.setAttribute("cx", "233.5");
          potRim.setAttribute("cy", "75.5");
          potRim.setAttribute("rx", "2.6");
          potRim.setAttribute("ry", "0.55");
          potRim.setAttribute("style", "fill:#d4815a;stroke:#8a4a20;stroke-width:0.25");
          var soil = document.createElementNS(svgNS, "ellipse");
          soil.setAttribute("cx", "233.5");
          soil.setAttribute("cy", "75.8");
          soil.setAttribute("rx", "2.1");
          soil.setAttribute("ry", "0.35");
          soil.setAttribute("style", "fill:#5a3a20;stroke:none");
          bigPotEls = [potBody, potRim, soil];
          return bigPotEls;
        }

        function showBigPot(animate) {
          if (bigPotEls.length === 0) createBigPot();
          // Hide original jar
          if (animate) {
            plantJar.style.transition = "opacity 0.4s ease";
            if (plantJarRim) plantJarRim.style.transition = "opacity 0.4s ease";
          }
          plantJar.style.opacity = "0";
          if (plantJarRim) plantJarRim.style.opacity = "0";
          // Show terracotta pot (insert before foliage so leaves draw on top)
          bigPotEls.forEach(function (el) {
            if (animate) {
              el.style.opacity = "0";
              el.style.transition = "opacity 0.6s ease";
            }
            plantGroup.insertBefore(el, foliageWrapper);
            if (animate) {
              requestAnimationFrame(function () {
                requestAnimationFrame(function () { el.style.opacity = "1"; });
              });
            }
          });
        }

        // Apply saved state immediately
        setPlantScale(currentPlantScale);
        if (potLevel > 0) showBigPot(false);

        // Water droplets animation
        function showWaterDrops() {
          for (var wi = 0; wi < 5; wi++) {
            (function (idx) {
              setTimeout(function () {
                var drop = document.createElementNS(svgNS, "ellipse");
                var dx = 232 + Math.random() * 3;
                var dy = 67 + Math.random() * 2;
                drop.setAttribute("cx", dx);
                drop.setAttribute("cy", dy);
                drop.setAttribute("rx", "0.3");
                drop.setAttribute("ry", "0.5");
                drop.setAttribute("style", "fill:#5088cc;fill-opacity:0.8");
                plantGroup.appendChild(drop);

                var t0 = performance.now();
                function fall(ts) {
                  var fp = Math.min((ts - t0) / 500, 1);
                  drop.setAttribute("cy", String(dy + fp * 9));
                  drop.style.opacity = String(1 - fp);
                  if (fp < 1) requestAnimationFrame(fall);
                  else if (drop.parentNode) drop.parentNode.removeChild(drop);
                }
                requestAnimationFrame(fall);
              }, idx * 80);
            })(wi);
          }
        }

        // Click handler
        plantGroup.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();

          if (plantGrowth < maxGrowth) {
            // Water the plant
            plantGrowth++;
            localStorage.setItem("plantGrowth", String(plantGrowth));
            showWaterDrops();
            var newScale = getTargetScale();
            setTimeout(function () { animatePlantGrowth(newScale); }, 300);

            var msgs = [
              "Watered!",
              "Growing nicely!",
              "Looking lush!",
              "Almost fully grown!",
              "Fully grown!"
            ];
            tooltip.textContent = msgs[plantGrowth - 1];
          } else if (potLevel < maxPot) {
            // Re-pot into a bigger pot — plant keeps its size, pot gets larger
            potLevel++;
            plantGrowth = 0;
            localStorage.setItem("plantPot", String(potLevel));
            localStorage.setItem("plantGrowth", "0");
            showBigPot(true);
            tooltip.textContent = "Re-potted! Room to grow";
          } else {
            tooltip.textContent = "A happy, healthy philodendron!";
          }
          tooltip.classList.add("visible");
          setTimeout(function () { tooltip.classList.remove("visible"); }, 1500);
        });

        // Hover tooltip
        plantGroup.addEventListener("mouseenter", function () {
          if (plantGrowth === 0 && potLevel === 0) {
            tooltip.textContent = "This plant looks thirsty...";
          } else if (plantGrowth < maxGrowth) {
            tooltip.textContent = "Water me more!";
          } else if (potLevel < maxPot) {
            tooltip.textContent = "Needs a bigger pot! Click to re-pot";
          } else {
            tooltip.textContent = "A happy, healthy philodendron!";
          }
          tooltip.classList.add("visible");
        });
        plantGroup.addEventListener("mouseleave", function () {
          tooltip.classList.remove("visible");
        });
        plantGroup.addEventListener("mousemove", function (e) {
          tooltip.style.left = (e.clientX + 12) + "px";
          tooltip.style.top = (e.clientY + 12) + "px";
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

        // Apply correct sky state based on current lamp state (fixes reload in dark mode)
        updateWindowScene();
      }
    });
});

// === KONAMI CODE EASTER EGG ===
(function () {
  var konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // up up down down left right left right B A
  var konamiPos = 0;
  var miceRunning = false;

  document.addEventListener("keydown", function (e) {
    if (e.keyCode === konamiSequence[konamiPos]) {
      konamiPos++;
      if (konamiPos === konamiSequence.length) {
        konamiPos = 0;
        if (!miceRunning) runMice();
      }
    } else {
      konamiPos = 0;
    }
  });

  function createMouse(delay, y, speed, flip) {
    var mouse = document.createElement("div");
    mouse.style.cssText =
      "position:fixed;left:-60px;top:" + y + "px;z-index:9999;pointer-events:none;" +
      "font-size:0;line-height:0;transition:none;" +
      (flip ? "transform:scaleX(1);" : "transform:scaleX(-1);");

    // Build a cute mouse with SVG
    var sz = 28;
    var svgNS = "http://www.w3.org/2000/svg";
    var svgE = document.createElementNS(svgNS, "svg");
    svgE.setAttribute("width", sz * 2);
    svgE.setAttribute("height", sz * 1.2);
    svgE.setAttribute("viewBox", "0 0 40 24");
    svgE.style.overflow = "visible";

    // Body
    var body = document.createElementNS(svgNS, "ellipse");
    body.setAttribute("cx", "20"); body.setAttribute("cy", "14");
    body.setAttribute("rx", "10"); body.setAttribute("ry", "6");
    body.setAttribute("style", "fill:#8a7a6a");
    svgE.appendChild(body);

    // Head
    var head = document.createElementNS(svgNS, "ellipse");
    head.setAttribute("cx", "32"); head.setAttribute("cy", "12");
    head.setAttribute("rx", "5"); head.setAttribute("ry", "4.5");
    head.setAttribute("style", "fill:#9a8a7a");
    svgE.appendChild(head);

    // Ears
    [[-1.5, 0], [2.5, -0.5]].forEach(function (off) {
      var ear = document.createElementNS(svgNS, "ellipse");
      ear.setAttribute("cx", 32 + off[0]); ear.setAttribute("cy", 8 + off[1]);
      ear.setAttribute("rx", "2.5"); ear.setAttribute("ry", "2.8");
      ear.setAttribute("style", "fill:#9a8a7a;stroke:#7a6a5a;stroke-width:0.3");
      svgE.appendChild(ear);
      var inner = document.createElementNS(svgNS, "ellipse");
      inner.setAttribute("cx", 32 + off[0]); inner.setAttribute("cy", 8.3 + off[1]);
      inner.setAttribute("rx", "1.5"); inner.setAttribute("ry", "1.8");
      inner.setAttribute("style", "fill:#e8b0a0");
      svgE.appendChild(inner);
    });

    // Eye
    var eye = document.createElementNS(svgNS, "circle");
    eye.setAttribute("cx", "34"); eye.setAttribute("cy", "11");
    eye.setAttribute("r", "1");
    eye.setAttribute("style", "fill:#1a1a1a");
    svgE.appendChild(eye);
    var eyeShine = document.createElementNS(svgNS, "circle");
    eyeShine.setAttribute("cx", "34.5"); eyeShine.setAttribute("cy", "10.5");
    eyeShine.setAttribute("r", "0.35");
    eyeShine.setAttribute("style", "fill:#ffffff");
    svgE.appendChild(eyeShine);

    // Nose
    var nose = document.createElementNS(svgNS, "circle");
    nose.setAttribute("cx", "37"); nose.setAttribute("cy", "12.5");
    nose.setAttribute("r", "0.8");
    nose.setAttribute("style", "fill:#e8a0a0");
    svgE.appendChild(nose);

    // Whiskers
    [[37.5, 11.5, 40, 10], [37.5, 12.5, 41, 12.5], [37.5, 13.5, 40, 15]].forEach(function (w) {
      var whisker = document.createElementNS(svgNS, "line");
      whisker.setAttribute("x1", w[0]); whisker.setAttribute("y1", w[1]);
      whisker.setAttribute("x2", w[2]); whisker.setAttribute("y2", w[3]);
      whisker.setAttribute("style", "stroke:#7a6a5a;stroke-width:0.3");
      svgE.appendChild(whisker);
    });

    // Tail
    var tail = document.createElementNS(svgNS, "path");
    tail.setAttribute("d", "M 10,14 C 6,12 2,16 -2,13");
    tail.setAttribute("style", "fill:none;stroke:#9a8a7a;stroke-width:1;stroke-linecap:round");
    svgE.appendChild(tail);

    // Front legs (animated with CSS)
    var legs = [];
    [28, 14].forEach(function (lx) {
      var leg = document.createElementNS(svgNS, "line");
      leg.setAttribute("x1", lx); leg.setAttribute("y1", "18");
      leg.setAttribute("x2", lx); leg.setAttribute("y2", "22");
      leg.setAttribute("style", "stroke:#8a7a6a;stroke-width:1.2;stroke-linecap:round");
      svgE.appendChild(leg);
      legs.push(leg);
    });

    mouse.appendChild(svgE);
    document.body.appendChild(mouse);

    // Animate running across screen
    var startX = flip ? window.innerWidth + 60 : -60;
    var endX = flip ? -60 : window.innerWidth + 60;
    var x = startX;
    var frame = 0;
    var startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;

      // Leg animation (alternating)
      frame++;
      if (frame % 3 === 0) {
        var legSwing = Math.sin(frame * 0.5) * 3;
        legs[0].setAttribute("x2", parseFloat(legs[0].getAttribute("x1")) + legSwing);
        legs[1].setAttribute("x2", parseFloat(legs[1].getAttribute("x1")) - legSwing);
      }

      // Slight vertical bob
      var bob = Math.sin(frame * 0.4) * 2;
      x = startX + (endX - startX) * (elapsed / (speed * 1000));
      mouse.style.left = x + "px";
      mouse.style.top = (y + bob) + "px";

      if ((flip && x > -60) || (!flip && x < window.innerWidth + 60)) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(mouse);
      }
    }

    setTimeout(function () {
      requestAnimationFrame(animate);
    }, delay);

    return mouse;
  }

  function runMice() {
    miceRunning = true;
    var viewH = window.innerHeight;
    // Three mice at different heights, speeds, and slight delays
    createMouse(0, viewH * 0.55, 2.2, false);
    createMouse(200, viewH * 0.65, 1.8, false);
    createMouse(500, viewH * 0.45, 2.5, false);

    setTimeout(function () { miceRunning = false; }, 4000);
  }
})();
