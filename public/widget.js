// public/widget.js
// Feature 2: Embeddable Widget Script — drop this on any website
// Usage: <script src="https://your-domain.com/widget.js" data-api-key="tk_..."></script>

(function () {
  "use strict";

  // Get the script tag itself to read attributes
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var apiKey = currentScript.getAttribute("data-api-key") || "";
  var theme = currentScript.getAttribute("data-theme") || "dark";
  var containerId = currentScript.getAttribute("data-container") || null;
  var appUrl = currentScript.getAttribute("data-url") || "https://your-taylos-domain.com";

  // Build the iframe src
  var widgetSrc = appUrl + "/widget?apiKey=" + encodeURIComponent(apiKey) + "&theme=" + encodeURIComponent(theme);

  // Create container if not specified
  var container;
  if (containerId) {
    container = document.getElementById(containerId);
  }
  if (!container) {
    container = document.createElement("div");
    container.id = "taylos-widget-container";
    container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;";
    document.body.appendChild(container);
  }

  // Create toggle button
  var btn = document.createElement("button");
  btn.id = "taylos-widget-toggle";
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>';
  btn.title = "Open Taylos Finance Analyser";
  btn.style.cssText = [
    "width:52px;height:52px;border-radius:50%;",
    "background:#d4af37;color:#0a1628;",
    "border:none;cursor:pointer;",
    "display:flex;align-items:center;justify-content:center;",
    "box-shadow:0 4px 24px rgba(212,175,55,0.4);",
    "transition:transform 0.2s;",
    "margin-left:auto;",
  ].join("");
  btn.addEventListener("mouseover", function () { btn.style.transform = "scale(1.1)"; });
  btn.addEventListener("mouseout", function () { btn.style.transform = "scale(1)"; });

  // Create iframe
  var iframe = document.createElement("iframe");
  iframe.src = widgetSrc;
  iframe.id = "taylos-widget-iframe";
  iframe.title = "Taylos Finance Analyser";
  iframe.allow = "clipboard-read; clipboard-write";
  iframe.style.cssText = [
    "width:400px;height:560px;",
    "border:none;border-radius:16px;",
    "box-shadow:0 24px 80px rgba(0,0,0,0.4);",
    "display:none;",
    "margin-bottom:8px;",
    "transition:all 0.3s;",
  ].join("");

  var isOpen = false;
  btn.addEventListener("click", function () {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? "block" : "none";
    btn.style.background = isOpen ? "#b8922a" : "#d4af37";
  });

  container.appendChild(iframe);
  container.appendChild(btn);

  // Expose API
  window.TaylosWidget = {
    open: function () { if (!isOpen) btn.click(); },
    close: function () { if (isOpen) btn.click(); },
    toggle: function () { btn.click(); },
    setApiKey: function (key) {
      apiKey = key;
      iframe.src = appUrl + "/widget?apiKey=" + encodeURIComponent(apiKey) + "&theme=" + encodeURIComponent(theme);
    },
  };
})();
