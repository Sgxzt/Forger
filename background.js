let datosDashboardTemporal = null;

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "descargarLista") {
    const blob = new Blob([request.texto], { type: "text/plain" }); // Creates a blob for generating the list
    const url = URL.createObjectURL(blob);
    browser.downloads.download({ url: url, filename: "forger_keywords.txt", saveAs: true });
    sendResponse({ status: "ok" });
  }
  //Dashboard Functions
  if (request.action === "abrirDashboard") {
    datosDashboardTemporal = request.datos;

    browser.tabs.create({
      url: browser.runtime.getURL("dashboard.html")
    });
    sendResponse({ status: "ok" });
  }

  if (request.action === "obtenerMetricas") {
    sendResponse(datosDashboardTemporal);
  }
  return true;
});

