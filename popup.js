document.getElementById("btnEscanear").addEventListener("click", async () => {
  //1. Obtain the checkboxes values
  const options = {
    minusculas: document.getElementById("filtroMinusculas").checked,
    ordenar: document.getElementById("filtroAlfabetico").checked,
    numeros: document.getElementById("filtroNumeros").checked,
    correos: document.getElementById("filtroCorreos").checked,
    urls: document.getElementById("filtroUrls").checked
  };

  //2. Search de tab that the user is seeing
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  //3. Inject the scrapper and use the options
  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["scrapper.js"]
  });

  //4. Send internal message to the page with the configuration choosed
  browser.tabs.sendMessage(tab.id, { action: "iniciarEscaneo", opciones: options }); 

  //Close the menu after click
  window.close();
});

