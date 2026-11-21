// ENTE KERALA APP

console.log("ENTE KERALA App Loaded");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./service-worker.js")
      .then(function () {
        console.log("App service worker registered");
      })
      .catch(function (error) {
        console.log("Service worker error:", error);
      });
  });
}
