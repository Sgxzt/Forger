//Lisen the message that comes from popup.js with the configs
browser.runtime.onMessage.addListener((mensaje) => {
  if (mensaje.action === "iniciarEscaneo") {
    const tiempoInicio = performance.now(); // -- count the time exactly

    const opciones = mensaje.opciones;
    let textoPagina = document.body.innerText;

    // Save finding in this unique list
    let palabrasFinales = [];

    //1. Email filter IF ACTIVE
    if (opciones.correos) {
      //Regular expresion standart for email capturing
      const correosEncontrados = textoPagina.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (correosEncontrados) palabrasFinales = palabrasFinales.concat(correosEncontrados);
    }

    //2. URls filter IF ACTIVE
    if (opciones.urls) {
      //Regular expression for url capturing
      const urlsEncontradas = textoPagina.match(/https?:\/\/[^\s]+|www\.[^\s]+/g);
      if (urlsEncontradas) palabrasFinales = palabrasFinales.concat(urlsEncontradas);
    }

    //3. Standart words and number extraction
    // If numbers is false we use regex without 0-9
    const patronRegex = opciones.numeros ? /[a-zA-Z0-9áéíóúüñ_-]+/g : /[a-zA-Záéíóúüñ_-]+/g;
    const palabrasNormales = textoPagina.match(patronRegex);

    if (palabrasNormales) {
      // Filter for more than 3 characters
      const filtradasPorLongitud = palabrasNormales.filter(p => p.length > 3);
      palabrasFinales = palabrasFinales.concat(filtradasPorLongitud);
    }

    //4. LowerCase filter IF active transforms all the list
    if (opciones.minusculas) {
      palabrasFinales = palabrasFinales.map(p => p.toLowerCase());
    }

    //5. Delete Duplicates
    const totalEncontradas = palabrasFinales.length;
    let listaUnica = [...new Set(palabrasFinales)];

    //6. Filter alfabetic order IF ACTIVE
    if (opciones.ordenar) {
      listaUnica.sort();
    }

    //Stadistics Content
    const totalUnicas = listaUnica.length; 
    const totalEliminadas = totalEncontradas - totalUnicas;

    //Calculate the timer 
    const tiempoTotal = ((performance.now() - tiempoInicio) / 1000).toFixed(2);
    const dominioActual = window.location.hostname; // This gets the domain

    //7. Send background to donwload
    if (totalUnicas > 0) {
       browser.runtime.sendMessage({
          action: "abrirDashboard",
          datos: { 
            lista: listaUnica.join("\n"),
            dominio: dominioActual,
            encontradas: totalEncontradas,
            unicas: totalUnicas,
            eliminadas: totalEliminadas,
            tiempo: tiempoTotal
          }
        });
    } else {
      alert("No elements found with the current filters");
    }
  }
});

