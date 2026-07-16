// Process and download scrapper request
browser.runtime.onMessage.addListener((request) => {
  if (request.action === "descargarLista") {
    const blob = new Blob([request.texto], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    browser.downloads.download({
      url: url,
      filename: "forger_keywords.txt",
      saveAs: true
    });
  }
});

