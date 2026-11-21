// ENTE KERALA APP

console.log("ENTE KERALA is ready");

const installButton = document.getElementById("installBtn");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register(
        "/ente-kerala-app/service-worker.js"
      );
      console.log("Service Worker registered");
    } catch (error) {
      console.error("Service Worker error:", error);
    }
  });
}
